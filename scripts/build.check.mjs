/**
 * ビルド成果物（dist/）を検証する。`vp run build` の後に走らせる。
 *
 *   node scripts/build.check.mjs
 *
 * ここで見るのは「エラーも警告も出ずに壊れる」もののうち、HTML を見れば分かるもの。
 *
 * 1. island がすべて <honox-island> で包まれているか
 *    hono 4.11.8 以降では、hono/css を使う island の後ろに並ぶ island が包まれなくなり、
 *    ハイドレートされない（CLAUDE.md「依存の固定」）。描画はされるので見た目では気づけない。
 *    以前は「about.html の <honox-island> が 17 個か」を手で数えていたが、技術スタックを
 *    1つ足すだけで 17 は嘘になる。だから「描画された数」と「包まれた数」を突き合わせる。
 *
 * 2. 1ページ内で id が重複していないか
 *    ツールチップは id で popover を引く。TechStackTag は名前から id を作るので
 *    （記号を _ に置換）、"C#" と "C_" のような名前が並ぶと黙って別のツールチップが開く。
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

let failed = 0;
const check = (ok, label, detail) => {
  if (!ok) failed++;
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(40)}${detail}`);
};
const heading = (text) => {
  console.log(`\n  ${text}`);
  console.log("  " + "─".repeat(64));
};

if (!existsSync(DIST)) {
  console.error("  dist/ がありません。先に `vp run build` を実行してください。");
  process.exit(1);
}

const pages = readdirSync(DIST)
  .filter((name) => name.endsWith(".html"))
  .map((name) => ({ name, html: readFileSync(join(DIST, name), "utf8") }));

const count = (html, pattern) => html.match(pattern)?.length ?? 0;

// ─── 1. island ───────────────────────────────────────────────────────────────

/**
 * island ごとに「1インスタンスにつき必ず1つ描かれる印」を決めておく。
 * 新しい island を足したらここにも足す（足し忘れは下の「未登録の island」で落ちる）。
 */
const ISLANDS = {
  TechStackTag: /\bid="tooltip-/g,
  InfoTooltip: /\bid="info-tooltip-/g,
};

const islandFiles = readdirSync(join(ROOT, "app/islands"))
  .filter((name) => name.endsWith(".tsx"))
  .map((name) => name.replace(/\.tsx$/, ""));

heading("island が <honox-island> で包まれているか");

for (const name of islandFiles) {
  check(name in ISLANDS, `登録済み: ${name}`, "scripts/build.check.mjs の ISLANDS");
}

let anyIsland = false;
for (const { name: page, html } of pages) {
  for (const [island, marker] of Object.entries(ISLANDS)) {
    const rendered = count(html, marker);
    if (rendered === 0) continue;
    anyIsland = true;
    const wrapped = count(
      html,
      new RegExp(`<honox-island component-name="/app/islands/${island}\\.tsx"`, "g"),
    );
    check(wrapped === rendered, `${page}: ${island}`, `描画 ${rendered} / 包まれた ${wrapped}`);
  }
}
// 印の正規表現が腐って 0 件になると、上は何も検査せずに通ってしまう
check(anyIsland, "island を1つ以上検出した", "印の正規表現が描画結果と合っているか");

// ─── 2. id の重複 ────────────────────────────────────────────────────────────

heading("1ページ内で id が重複していないか");

for (const { name: page, html } of pages) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  check(dup.length === 0, page, dup.length ? `重複: ${dup.join(", ")}` : `${ids.length} 個`);
}

console.log();
if (failed) {
  console.log(`  ${failed} 件の不一致\n`);
  process.exit(1);
}
console.log("  ビルド成果物に問題なし\n");
