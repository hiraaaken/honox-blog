/**
 * テーマの3状態を検証する。
 *
 *   node scripts/theme.check.mjs
 *
 * 前身の theme-route.check.mjs は app/routes/theme.ts のロジックを別ファイルへ
 * 複製して検証していた。ハンドラの中身は正しかったので検査は通り続けたが、
 * 実際には `/` `/posts` `/tags` `/about` が SSG されて Workers Assets に
 * 先取りされ、そのハンドラは一度も呼ばれていなかった。
 * 複製したロジックをテストしても、ロジックが到達不能になったことは検出できない。
 *
 * そこでこの検査は
 *   1. app/lib/theme.ts を「複製せずに import して」写像を検証し、
 *   2. `<head>` に入る実物のスクリプトを偽の DOM の上で実行し、
 *   3. 到達経路（renderer が実際にそれを出力しているか、cookie 方式の残骸が
 *      無いか）を静的に確認する。
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  THEME_CHOICES,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  normalizeThemeChoice,
  themeAttribute,
} from "../app/lib/theme.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(ROOT, file), "utf8");

/** app/ 配下の .ts / .tsx を全部見る。対象をベタ書きすると追加漏れで腐る */
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

/* ── 1. 3状態 → data-theme の写像 ──────────────────────────── */

console.log("\n  3状態と data-theme の対応");
console.log("  " + "─".repeat(62));

const EXPECTED = { system: null, light: "light", dark: "dark" };

check(
  THEME_CHOICES.length === 3,
  "状態は3つある",
  THEME_CHOICES.join(" / "),
);

for (const choice of THEME_CHOICES) {
  const got = themeAttribute(choice);
  check(
    got === EXPECTED[choice],
    `${choice} →`,
    got === null ? "属性を付けない（システムに従う）" : `data-theme="${got}"`,
  );
}

check(
  normalizeThemeChoice("dark-mode") === "system" &&
    normalizeThemeChoice(null) === "system",
  "壊れた保存値は system に倒す",
  "normalizeThemeChoice",
);

/* ── 2. <head> に入る実物のスクリプトを走らせる ────────────── */

console.log("\n  初期化スクリプト（実物を偽 DOM 上で実行）");
console.log("  " + "─".repeat(62));

/**
 * THEME_INIT_SCRIPT を最小の偽 DOM の上で実行する。
 * スクリプトは `<head>` に入る実物をそのまま走らせる（複製しない）。
 *
 * ボタンは2組用意する。ヘッダーとハンバーガー内の2箇所に置いてあり、
 * クリックの委譲と `aria-pressed` の同期が両方に効くことを見たいため。
 */
function mountInitScript({ stored = null, cookie = "", storageThrows = false } = {}) {
  const store = new Map();
  if (stored !== null) store.set(THEME_STORAGE_KEY, stored);

  const buttons = ["system", "light", "dark", "system", "light", "dark"].map(
    (option) => ({
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
    }),
  );

  const listeners = {};
  const dataset = {};
  const doc = {
    documentElement: { dataset },
    cookie,
    querySelectorAll: (selector) =>
      selector === "[data-theme-option]" ? buttons : [],
    addEventListener: (type, handler) => {
      (listeners[type] ??= []).push(handler);
    },
  };

  const localStorage = storageThrows
    ? {
        getItem() {
          throw new Error("denied");
        },
        setItem() {
          throw new Error("denied");
        },
      }
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
      try {
        return localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        return null;
      }
    },
    get cookie() {
      return doc.cookie;
    },
    buttons,
    pressed: () => buttons.map((b) => b.getAttribute("aria-pressed")),
    click: (option) =>
      fire("click", {
        target: buttons.find((b) => b.attributes["data-theme-option"] === option),
      }),
    clickAt: (index) => fire("click", { target: buttons[index] }),
    ready: () => fire("DOMContentLoaded", {}),
  };
}

const runInitScript = mountInitScript;

for (const choice of THEME_CHOICES) {
  const r = runInitScript({ stored: choice });
  check(
    r.attribute === EXPECTED[choice],
    `保存値 ${choice} を復元する`,
    r.attribute === null ? "属性なし" : `data-theme="${r.attribute}"`,
  );
}

{
  const r = runInitScript();
  check(
    r.attribute === null && r.stored === "system",
    "未設定は system",
    "属性なし / localStorage=system",
  );
}

// 旧 cookie 方式からの移行。一度だけ引き継いで cookie は捨てる
{
  const r = runInitScript({ cookie: "foo=1; theme=dark; bar=2" });
  check(
    r.attribute === "dark" && r.stored === "dark",
    "旧 cookie を引き継ぐ",
    `data-theme="${r.attribute}" / localStorage=${r.stored}`,
  );
  check(
    /Max-Age=0/.test(r.cookie),
    "引き継いだら cookie を捨てる",
    r.cookie,
  );
}

// localStorage が使えない環境（プライベートモード等）で落ちない
{
  let threw = false;
  let dom = null;
  try {
    dom = mountInitScript({ storageThrows: true });
  } catch {
    threw = true;
  }
  check(
    !threw && dom.attribute === null,
    "localStorage が読めなくても落ちない",
    "例外を投げず、属性も付けない",
  );
  if (!threw) {
    dom.click("dark");
    check(
      dom.attribute === "dark",
      "保存できなくても切り替えは効く",
      `data-theme="${dom.attribute}"`,
    );
  }
}

/* ── 切り替え（クリックの委譲） ─────────────────────────────── */

console.log("\n  切り替え（リロードなし）");
console.log("  " + "─".repeat(62));

{
  const dom = mountInitScript();
  dom.ready();

  check(
    dom.pressed().join(",") === "true,false,false,true,false,false",
    "初期は system が押された状態",
    "ヘッダーとハンバーガーの両方",
  );

  for (const choice of ["dark", "light", "system"]) {
    dom.click(choice);
    check(
      dom.attribute === EXPECTED[choice] && dom.stored === choice,
      `${choice} を押すと切り替わる`,
      `data-theme=${dom.attribute ?? "（無し）"} / localStorage=${dom.stored}`,
    );
  }

  dom.click("dark");
  check(
    dom.pressed().join(",") === "false,false,true,false,false,true",
    "aria-pressed が両方の組で追従する",
    dom.pressed().join(","),
  );

  // ハンバーガー側（2組目 = index 3..5）から押しても効く。
  // honox は1ページにつき最初の island しかハイドレートしないので、
  // island にしていたらここが死んでいた
  dom.clickAt(4); // 2組目の "light"
  check(
    dom.attribute === "light" && dom.stored === "light",
    "2組目のボタンでも切り替わる",
    `data-theme="${dom.attribute}"（document への委譲なのでハイドレーション不要）`,
  );
  check(
    dom.pressed().join(",") === "false,true,false,false,true,false",
    "2組目から押しても両方の aria-pressed が揃う",
    dom.pressed().join(","),
  );
}

/* ── 3. 到達経路 ───────────────────────────────────────────── */

console.log("\n  到達経路（検査が通るのに壊れていた状態を防ぐ）");
console.log("  " + "─".repeat(62));

const renderer = read("app/routes/_renderer.tsx");

check(
  /THEME_INIT_SCRIPT/.test(renderer) &&
    /dangerouslySetInnerHTML=\{\{\s*__html:\s*THEME_INIT_SCRIPT\s*\}\}/.test(
      renderer,
    ),
  "renderer が実際に出力している",
  "_renderer.tsx → <script>",
);

check(
  !/data-theme=\{/.test(renderer),
  "サーバは data-theme を決めない",
  "SSG されたページでは cookie を読めないため",
);

// cookie 方式の残骸。正が2箇所にあると片方だけ古い値が残る
const COOKIE_USE = /(?:get|set)Cookie\s*\(|from\s+["']hono\/cookie["']/;
const cookieUse = [...walk("app")].filter((f) => COOKIE_USE.test(read(f)));
check(
  cookieUse.length === 0,
  "cookie 方式の残骸が無い",
  cookieUse.length === 0
    ? `app/ 配下 ${[...walk("app")].length} ファイルを走査`
    : cookieUse.join(", "),
);

check(
  !existsSync(join(ROOT, "app/routes/theme.ts")),
  "/theme ルートが無い",
  "切り替えにサーバ往復は要らない",
);

/* honox は1ページにつき最初の island しか <honox-island> で包まない。
   ヘッダーの切り替えを island にすると常にそれが「最初」になり、
   /about の TechStackTag などが巻き添えで死ぬ */
check(
  existsSync(join(ROOT, "app/components/ThemeToggle.tsx")) &&
    !existsSync(join(ROOT, "app/islands/ThemeToggle.tsx")),
  "切り替えは island ではない",
  "ハイドレーションに依存させない",
);

/* ── 4. CSS の出し分け ─────────────────────────────────────── */

console.log("\n  CSS の出し分け");
console.log("  " + "─".repeat(62));

const componentsCss = read("app/styles/layers/components.css");

check(
  /:root:not\(\[data-theme\]\)\s+\[data-theme-option="system"\]/.test(
    componentsCss,
  ),
  "system は属性の不在で引いている",
  ':root:not([data-theme])',
);

for (const value of ["light", "dark"]) {
  check(
    new RegExp(
      `:root\\[data-theme="${value}"\\]\\s+\\[data-theme-option="${value}"\\]`,
    ).test(componentsCss),
    `${value} を引いている`,
    `:root[data-theme="${value}"]`,
  );
}

/* `data-theme-option` は CSS からは定数を参照できないので3箇所に直書きされる。
   ずれると黙って壊れる（クリックが拾われない / 選択が光らない）ので押さえる */
const SPELLED_IN = {
  "app/lib/theme.ts": /\[data-theme-option\]/,
  "app/components/ThemeToggle.tsx": /data-theme-option=\{/,
  "app/styles/layers/components.css": /\[data-theme-option[\]=]/,
};
for (const [file, pattern] of Object.entries(SPELLED_IN)) {
  check(pattern.test(read(file)), `${file} が同じ綴りを使っている`, "data-theme-option");
}

console.log(
  failed === 0
    ? "\n  3状態すべてが data-theme に正しく写り、その経路が繋がっている\n"
    : `\n  ${failed} 件が期待と異なる\n`,
);
process.exit(failed === 0 ? 0 : 1);
