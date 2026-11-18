// サイト共通の既定 OGP 画像（public/og.png, 1200x630）を生成する。
//
//   node scripts/og-image.mjs
//
// 色はハードコードせず、app/styles/layers/ の実物のトークンを読む。
// トークンやマスコットを変えたら再生成してコミットする（ビルドには組み込まない。
// CI でフォントを取りに行くと結果がネットワークに左右されるため）。
//
// light-dark() は color-scheme: light で解決させる。SNS のカードはサイトのテーマを
// 知らないので、明るい側を既定とする。
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// Playwright はプロジェクトの依存に入れていない（生成はたまにしか走らないため）。
// グローバルに入っているものを require の解決（NODE_PATH）で拾う。
const { chromium } = createRequire(import.meta.url)("playwright");

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = fileURLToPath(new URL("public/og.png", root));

const [tokens, components, mascotSource] = await Promise.all([
  read("app/styles/layers/tokens.css"),
  read("app/styles/layers/components.css"),
  read("app/components/ui/MascotIcon.tsx"),
]);

const mascot = mascotSource.match(/<svg[\s\S]*<\/svg>/)?.[0];
if (!mascot) throw new Error("MascotIcon.tsx から <svg> を取り出せなかった");

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400..800&display=block" />
<style>
${tokens}
${components}
:root { color-scheme: light; }
* { box-sizing: border-box; margin: 0; }
body {
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  overflow: hidden;
  background: var(--ground);
  color: var(--ink);
  font-family: var(--font-sans);
  display: grid;
  grid-template-columns: 300px 1fr;
  align-items: center;
  gap: 72px;
  padding: 0 64px 0 72px;
}
.mascot svg { width: 300px; height: auto; aspect-ratio: 203 / 150; display: block; }
.bubble {
  position: relative;
  background: var(--speech-bubble-bg);
  color: var(--speech-bubble-fg);
  border: 4px solid var(--color-speech-bubble-border);
  box-shadow: 8px 8px 0 var(--color-speech-bubble-shadow);
  border-radius: 50%;
  padding: 80px 56px;
  text-align: center;
}
.bubble::before, .bubble::after {
  content: "";
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--speech-bubble-bg);
  border: 4px solid var(--color-speech-bubble-border);
}
.bubble::before { width: 44px; left: -36px; bottom: 22%; box-shadow: 5px 5px 0 var(--color-speech-bubble-shadow); }
.bubble::after { width: 24px; left: -76px; bottom: 14%; box-shadow: 3px 3px 0 var(--color-speech-bubble-shadow); }
h1 { font-size: 76px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
p { margin-top: 16px; font-size: 26px; white-space: nowrap; font-weight: 500; letter-spacing: -0.01em; }
</style>
</head>
<body>
  <div class="mascot">${mascot}</div>
  <div class="bubble">
    <h1>hiraaaken.dev</h1>
    <p>programming, technology, and my thoughts.</p>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const jost = await page.evaluate(() => document.fonts.check('700 76px "Jost"'));
  if (!jost) throw new Error("Jost が読み込めていない。代替フォントで書き出すのを防ぐため中断する");
  await page.screenshot({ path: OUTPUT, type: "png" });
  console.log(`wrote ${OUTPUT}`);
} finally {
  await browser.close();
}
