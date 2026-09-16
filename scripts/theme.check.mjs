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
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(34)}${detail}`);
};

const heading = (text) => {
  console.log(`\n  ${text}`);
  console.log("  " + "─".repeat(62));
};

/** system は属性の不在に写る。3状態のうちここだけが値を持たない */
const EXPECTED = { system: null, light: "light", dark: "dark" };
const VALUES = THEME_CHOICES.map((c) => c.value);

/* ── 実物のスクリプトを偽 DOM 上で走らせる ─────────────────── */

/**
 * ボタンは2組。ヘッダーとハンバーガー内の2箇所に置いてあり、
 * クリックの委譲と aria-pressed の同期が両方に効くことを見たい。
 */
function mount({ stored = null, cookie = "", storageThrows = false } = {}) {
  const store = new Map();
  if (stored !== null) store.set("theme", stored);

  const buttons = [...VALUES, ...VALUES].map((option) => ({
    attributes: { "data-theme-option": option },
    getAttribute(name) {
      return name in this.attributes ? this.attributes[name] : null;
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    closest(selector) {
      return selector === "[data-theme-option]" ? this : null;
    },
  }));

  const listeners = {};
  const dataset = {};
  const doc = {
    documentElement: { dataset },
    cookie,
    querySelectorAll: (s) => (s === "[data-theme-option]" ? buttons : []),
    addEventListener: (type, handler) => {
      (listeners[type] ??= []).push(handler);
    },
  };

  const throwing = () => {
    throw new Error("denied");
  };
  const localStorage = storageThrows
    ? { getItem: throwing, setItem: throwing }
    : {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
      };

  new Function("document", "localStorage", THEME_INIT_SCRIPT)(doc, localStorage);

  const fire = (type, event) =>
    (listeners[type] ?? []).forEach((handler) => handler(event));

  return {
    get attribute() {
      return "theme" in dataset ? dataset.theme : null;
    },
    get stored() {
      return store.get("theme") ?? null;
    },
    get cookie() {
      return doc.cookie;
    },
    pressed: () => buttons.map((b) => b.getAttribute("aria-pressed")).join(","),
    clickAt: (index) => fire("click", { target: buttons[index] }),
    click: (value) => fire("click", { target: buttons[VALUES.indexOf(value)] }),
    ready: () => fire("DOMContentLoaded", {}),
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
    dom.attribute === null && dom.stored === "system",
    "未設定は system",
    "属性なし / localStorage=system",
  );
}

{
  const dom = mount({ stored: "dark-mode" });
  check(dom.attribute === null, "壊れた保存値は system に倒す", "属性なし");
}

// 旧 cookie 方式（#78 以前）からの移行
{
  const dom = mount({ cookie: "foo=1; theme=dark; bar=2" });
  check(
    dom.attribute === "dark" && dom.stored === "dark",
    "旧 cookie を引き継ぐ",
    `data-theme="${dom.attribute}" / localStorage=${dom.stored}`,
  );
  check(/Max-Age=0/.test(dom.cookie), "引き継いだら cookie を捨てる", dom.cookie);
}

heading("切り替え（リロードなし）");

{
  const dom = mount();
  dom.ready();
  check(
    dom.pressed() === "true,false,false,true,false,false",
    "初期は system が押された状態",
    "ヘッダーとハンバーガーの両方",
  );

  for (const value of ["dark", "light", "system"]) {
    dom.click(value);
    check(
      dom.attribute === EXPECTED[value] && dom.stored === value,
      `${value} を押すと切り替わる`,
      `data-theme=${dom.attribute ?? "（無し）"} / localStorage=${dom.stored}`,
    );
  }

  dom.click("dark");
  check(
    dom.pressed() === "false,false,true,false,false,true",
    "aria-pressed が両方の組で追従する",
    dom.pressed(),
  );

  // honox は1ページにつき最初の island しかハイドレートしない。
  // island にしていたらハンバーガー側（2組目）が死んでいた
  dom.clickAt(4);
  check(
    dom.attribute === "light" && dom.stored === "light",
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

/* ── 到達経路（検査が通るのに壊れていた状態を防ぐ） ─────────── */

heading("到達経路");

const renderer = read("app/routes/_renderer.tsx");

check(
  /dangerouslySetInnerHTML=\{\{\s*__html:\s*THEME_INIT_SCRIPT\s*\}\}/.test(renderer),
  "renderer が実際に出力している",
  "_renderer.tsx → <script>",
);

check(
  !/data-theme=\{/.test(renderer),
  "サーバは data-theme を決めない",
  "SSG されたページでは cookie を読めないため",
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

/* ── CSS の出し分け ────────────────────────────────────────── */

heading("CSS の出し分け");

const componentsCss = read("app/styles/layers/components.css");

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
