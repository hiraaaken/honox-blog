/**
 * テーマ切り替えを検証する。
 *
 *   node scripts/theme.check.mjs
 *
 * 前身の theme-route.check.mjs はハンドラのロジックを別ファイルへ複製して
 * 検証していた。中身は正しかったので緑のままだったが、そのハンドラは
 * Workers Assets に先取りされて一度も呼ばれていなかった（#78）。
 * だからここでは複製を作らず、`<head>` に入る実物のスクリプトを
 * 偽 DOM 上で走らせ、さらにそれが出力される経路まで見る。
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { THEME_CHOICES, THEME_INIT_SCRIPT } from "../app/lib/theme.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(ROOT, file), "utf8");

/** 対象をベタ書きすると追加漏れで腐るので app/ 配下を全部見る */
function* walk(dir) {
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.tsx?$/.test(entry.name)) yield path;
  }
}

let failed = 0;
const check = (ok, label, detail) => {
  if (!ok) failed++;
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(36)}${detail}`);
};

const heading = (text) => {
  console.log(`\n  ${text}`);
  console.log("  " + "─".repeat(64));
};

/** system は属性の不在に写る。3状態のうちここだけが値を持たない */
const EXPECTED = { system: null, light: "light", dark: "dark" };
const VALUES = THEME_CHOICES.map((c) => c.value);
const SEL = "[data-theme-option]";

/* ── 実物のスクリプトを偽 DOM 上で走らせる ─────────────────── */

/**
 * ボタンは2組。ヘッダーとハンバーガー内の2箇所に置いてあり、クリックも
 * 矢印キーも aria-checked の同期も、両方に効くことを見たい。
 *
 * `viewTransitions` を立てると callback を次フレームまで遅らせる。
 * 実物と同じく非同期になるので、連打時に current が巻き戻らないかを試せる。
 */
function mount({
  stored = null,
  storageThrows = false,
  reducedMotion = false,
  viewTransitions = false,
} = {}) {
  const store = new Map();
  if (stored !== null) store.set("theme", stored);

  let focused = null;
  const groups = [0, 1].map((groupIndex) => {
    const group = { role: "radiogroup" };
    group.radios = VALUES.map((value) => ({
      dataset: { themeOption: value },
      tabIndex: value === "system" ? 0 : -1,
      attributes: {},
      setAttribute(name, v) {
        this.attributes[name] = String(v);
      },
      getAttribute(name) {
        return name in this.attributes ? this.attributes[name] : null;
      },
      closest(selector) {
        if (selector === SEL) return this;
        if (selector === '[role="radiogroup"]') return group;
        return null;
      },
      focus() {
        focused = this;
      },
      groupIndex: null,
    }));
    group.radios.forEach((r) => (r.groupIndex = groupIndex));
    group.querySelector = (selector) => {
      const m = selector.match(/\[data-theme-option="(.+)"\]/);
      return group.radios.find((r) => r.dataset.themeOption === m?.[1]) ?? null;
    };
    return group;
  });
  const radios = groups.flatMap((g) => g.radios);

  const pending = [];
  const docListeners = {};
  const winListeners = {};
  const dataset = {};

  const document = {
    documentElement: { dataset },
    querySelectorAll: (selector) => (selector === SEL ? radios : []),
    addEventListener: (type, handler) => {
      (docListeners[type] ??= []).push(handler);
    },
  };
  if (viewTransitions) {
    // 実物と同じく callback は即時実行しない
    document.startViewTransition = (cb) => {
      pending.push(cb);
      return { finished: Promise.resolve() };
    };
  }

  const throwing = () => {
    throw new Error("denied");
  };
  const window = {
    localStorage: storageThrows
      ? { getItem: throwing, setItem: throwing }
      : {
          getItem: (k) => (store.has(k) ? store.get(k) : null),
          setItem: (k, v) => store.set(k, String(v)),
        },
    matchMedia: (query) => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
    }),
    addEventListener: (type, handler) => {
      (winListeners[type] ??= []).push(handler);
    },
  };

  new Function("document", "window", THEME_INIT_SCRIPT)(document, window);

  const flush = () => {
    while (pending.length) pending.shift()();
  };

  return {
    get attribute() {
      return "theme" in dataset ? dataset.theme : null;
    },
    get stored() {
      return store.get("theme") ?? null;
    },
    get focused() {
      return focused?.dataset.themeOption ?? null;
    },
    get focusedGroup() {
      return focused?.groupIndex ?? null;
    },
    get pendingTransitions() {
      return pending.length;
    },
    radios,
    checked: () => radios.map((r) => r.getAttribute("aria-checked")).join(","),
    tabStops: () => radios.filter((r) => r.tabIndex >= 0).length,
    flush,
    click: (value, group = 0) =>
      (docListeners.click ?? []).forEach((h) =>
        h({ target: groups[group].querySelector(`[data-theme-option="${value}"]`) }),
      ),
    press: (key, from, group = 0) =>
      (docListeners.keydown ?? []).forEach((h) =>
        h({
          key,
          preventDefault() {},
          target: groups[group].querySelector(`[data-theme-option="${from}"]`),
        }),
      ),
    storage: (key, newValue) =>
      (winListeners.storage ?? []).forEach((h) => h({ key, newValue })),
    ready: () => (docListeners.DOMContentLoaded ?? []).forEach((h) => h()),
  };
}

heading("保存値の復元（実物のスクリプトを実行）");

check(VALUES.length === 3, "状態は3つある", VALUES.join(" / "));

for (const value of VALUES) {
  const dom = mount({ stored: value });
  check(
    dom.attribute === EXPECTED[value],
    `${value} を復元する`,
    dom.attribute === null ? "属性なし（システムに従う）" : `data-theme="${dom.attribute}"`,
  );
}

{
  const dom = mount();
  check(
    dom.attribute === null && dom.stored === null,
    "未設定は system",
    "属性なし / 既定を書き戻さない",
  );
}

check(mount({ stored: "dark-mode" }).attribute === null, "壊れた保存値は system に倒す", "属性なし");

heading("切り替え（リロードなし）");

{
  const dom = mount();
  dom.ready();

  for (const value of ["dark", "light", "system"]) {
    dom.click(value);
    check(
      dom.attribute === EXPECTED[value] && dom.stored === value,
      `${value} を押すと切り替わる`,
      `data-theme=${dom.attribute ?? "（無し）"} / localStorage=${dom.stored}`,
    );
  }

  // honox は1ページにつき最初の island しかハイドレートしない。
  // island にしていたらハンバーガー側（2組目）が死んでいた
  dom.click("dark", 1);
  check(
    dom.attribute === "dark" && dom.stored === "dark",
    "2組目のボタンでも切り替わる",
    "document への委譲なのでハイドレーション不要",
  );
}

// プライベートモード等、localStorage が投げる環境
{
  let dom = null;
  try {
    dom = mount({ storageThrows: true });
  } catch {
    /* 落ちたら dom は null のまま */
  }
  check(dom !== null && dom.attribute === null, "localStorage が読めなくても落ちない", "例外を投げない");
  if (dom) {
    dom.click("dark");
    check(dom.attribute === "dark", "保存できなくても切り替えは効く", 'data-theme="dark"');
  }
}

heading("radiogroup（相互排他なので radio パターン）");

{
  const dom = mount();
  dom.ready();

  check(
    dom.checked() === "true,false,false,true,false,false",
    "初期は system が checked",
    "ヘッダーとハンバーガーの両方",
  );

  check(
    dom.radios.every((r) => r.getAttribute("aria-pressed") === null),
    "aria-pressed は使わない",
    "相互排他は aria-checked で表す",
  );

  check(dom.tabStops() === 2, "タブストップは1組につき1つ", `全体で ${dom.tabStops()} 個（2組ぶん）`);

  dom.click("dark");
  check(
    dom.checked() === "false,false,true,false,false,true",
    "checked が両方の組で追従する",
    dom.checked(),
  );
  check(
    dom.radios.filter((r) => r.tabIndex >= 0).every((r) => r.dataset.themeOption === "dark"),
    "タブストップが選択中へ移る",
    "roving tabindex",
  );
}

// 矢印キーはフォーカスと選択を同時に動かす
{
  const dom = mount();
  dom.ready();

  dom.press("ArrowRight", "system");
  check(
    dom.attribute === "light" && dom.focused === "light",
    "→ で次へ進む",
    `system → ${dom.focused}`,
  );

  dom.press("ArrowRight", "light");
  dom.press("ArrowRight", "dark");
  check(dom.attribute === null, "→ は端で先頭へ回り込む", "dark → system");

  dom.press("ArrowLeft", "system");
  check(dom.attribute === "dark", "← は端で末尾へ回り込む", "system → dark");

  dom.press("ArrowUp", "dark");
  dom.press("ArrowDown", "light");
  check(dom.attribute === "dark", "↑↓ も同じに動く", "dark → light → dark");

  const before = dom.attribute;
  dom.press("Tab", "dark");
  check(dom.attribute === before, "Tab は奪わない", "グループから出られる");

  // 2組目から押したら、フォーカスは2組目の中で動く
  dom.press("ArrowRight", "dark", 1);
  check(
    dom.focused === "system" && dom.focusedGroup === 1,
    "フォーカスは押した組の中で動く",
    `${dom.focusedGroup}組目の ${dom.focused} へ`,
  );
  dom.press("ArrowRight", "system", 0);
  check(
    dom.focused === "light" && dom.focusedGroup === 0,
    "1組目から押せば1組目へ",
    `${dom.focusedGroup}組目の ${dom.focused} へ`,
  );
}

heading("別タブとの同期");

{
  const dom = mount();
  dom.ready();
  dom.storage("theme", "dark");
  check(dom.attribute === "dark", "別タブの変更に追従する", 'storage イベント → data-theme="dark"');
  check(dom.checked() === "false,false,true,false,false,true", "checked も追従する", dom.checked());

  dom.storage("theme", "light");
  check(dom.attribute === "light", "続けて届いても追従する", 'data-theme="light"');
  // このタブは一度もボタンを押していないので、何も保存していないはず
  check(dom.stored === null, "書き戻さない", "他タブ発の変更は保存しない");

  dom.storage("other-key", "dark");
  check(dom.attribute === "light", "別のキーは無視する", "theme 以外に反応しない");

  dom.storage("theme", null); // localStorage.clear() で newValue は null
  check(dom.attribute === null, "クリアされたら system に戻る", "属性なし");
}

heading("View Transition");

{
  const dom = mount({ viewTransitions: true });
  dom.ready();
  dom.click("dark");
  check(dom.pendingTransitions === 1, "対応していれば使う", "startViewTransition を1回呼ぶ");
  check(dom.attribute === null, "callback 前は DOM を触らない", "描画は次フレーム");

  // callback が遅れても current は同期で進んでいる＝連打しても巻き戻らない
  dom.click("light");
  dom.flush();
  check(
    dom.attribute === "light" && dom.stored === "light",
    "callback が遅れても連打が壊れない",
    "current は同期で確定させている",
  );
}

{
  const dom = mount({ viewTransitions: true, reducedMotion: true });
  dom.click("dark");
  check(
    dom.pendingTransitions === 0 && dom.attribute === "dark",
    "動きを減らす設定なら使わない",
    "prefers-reduced-motion: reduce",
  );
}

{
  const dom = mount({ viewTransitions: false });
  dom.click("dark");
  check(dom.attribute === "dark", "非対応ブラウザでも切り替わる", "startViewTransition が無い場合");
}

/* ── 到達経路（検査が通るのに壊れていた状態を防ぐ） ─────────── */

heading("到達経路");

const renderer = read("app/routes/_renderer.tsx");
const themeSource = read("app/lib/theme.ts");

check(
  /<script>\{raw\(THEME_INIT_SCRIPT\)\}<\/script>/.test(renderer),
  "renderer が実際に出力している",
  "_renderer.tsx → <script>",
);

check(!/data-theme=\{/.test(renderer), "サーバは data-theme を決めない", "SSG では cookie を読めない");

// モジュールは常に defer されるので、描画前に走らずちらつきを防げない
check(
  !/<script[^>]*type=["']module["'][^>]*>\s*\{?\s*THEME_INIT_SCRIPT/.test(renderer) &&
    !/type="module"/.test(renderer),
  "初期化スクリプトは module ではない",
  "module は常に defer される",
);

// 正が2箇所にあると片方だけ古い値が残る
const COOKIE_USE = /(?:get|set)Cookie\s*\(|from\s+["']hono\/cookie["']/;
const files = [...walk("app")];
const cookieUse = files.filter((f) => COOKIE_USE.test(read(f)));
check(
  cookieUse.length === 0,
  "cookie 方式の残骸が無い",
  cookieUse.length === 0 ? `app/ 配下 ${files.length} ファイルを走査` : cookieUse.join(", "),
);

check(
  !existsSync(join(ROOT, "app/routes/theme.ts")),
  "/theme ルートが無い",
  "切り替えにサーバ往復は要らない",
);

check(
  existsSync(join(ROOT, "app/components/ThemeToggle.tsx")) &&
    !existsSync(join(ROOT, "app/islands/ThemeToggle.tsx")),
  "切り替えは island ではない",
  "honox は最初の island しか包まない",
);

// 裸のグローバルを掴むと検査が偽 DOM を差し込めなくなる
{
  const body = themeSource.slice(themeSource.indexOf("THEME_INIT_SCRIPT"));
  const bare = ["localStorage", "matchMedia", "addEventListener"].filter((name) =>
    new RegExp(`(^|[^.\\w])${name}\\s*[.(]`, "m").test(body.replace(/window\.\w+/g, "")),
  );
  check(bare.length === 0, "グローバルは window 経由で触る", bare.length ? bare.join(", ") : "localStorage / matchMedia / addEventListener");
}

/* ── CSS の出し分け ────────────────────────────────────────── */

heading("CSS");

const componentsCss = read("app/styles/layers/components.css");
const baseCss = read("app/styles/layers/base.css");

check(
  /:root:not\(\[data-theme\]\)\s+\[data-theme-option="system"\]/.test(componentsCss),
  "system は属性の不在で引いている",
  ":root:not([data-theme])",
);

for (const value of ["light", "dark"]) {
  check(
    new RegExp(`:root\\[data-theme="${value}"\\]\\s+\\[data-theme-option="${value}"\\]`).test(
      componentsCss,
    ),
    `${value} を引いている`,
    `:root[data-theme="${value}"]`,
  );
}

check(
  /@media \(prefers-reduced-motion: reduce\)[\s\S]{0,200}::view-transition-old\(\*\)/.test(baseCss),
  "View Transition も reduced-motion を尊重",
  "CSS 側でもアニメーションを止める",
);

// CSS からは定数を参照できないので3箇所に直書きされる。ずれると黙って壊れる
const SPELLED_IN = {
  "app/lib/theme.ts": /\[data-theme-option\]/,
  "app/components/ThemeToggle.tsx": /data-theme-option=\{/,
  "app/styles/layers/components.css": /\[data-theme-option[\]=]/,
};
for (const [file, pattern] of Object.entries(SPELLED_IN)) {
  check(pattern.test(read(file)), `${file}`, "data-theme-option");
}

console.log(
  failed === 0
    ? "\n  3状態すべてが data-theme に正しく写り、その経路が繋がっている\n"
    : `\n  ${failed} 件が期待と異なる\n`,
);
process.exit(failed === 0 ? 0 : 1);
