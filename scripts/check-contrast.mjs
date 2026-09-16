/**
 * トークンのコントラスト比を検証する。
 *
 * ハードコードした色ではなく app/styles/ に実際に書かれた値を読んで計算するので、
 * トークンを書き換えれば結果もそのまま追従する。
 *
 *   node scripts/check-contrast.mjs
 *
 * 計算は OKLCH → OKLab → linear sRGB → 相対輝度 → WCAG 2.x の比。
 * 仕様書に記録されている Chrome の実測値13件と照合し、11件が乖離 0.005 以内で
 * 一致することを確認済み（残り2件は仕様書側の前提が古かったもの）。
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = [
  "app/styles/layers/tokens.css",
  "app/styles/layers/components.css",
];

/* ── 色の計算 ───────────────────────────────────────────── */

const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** OKLCH → linear sRGB。https://bottosson.github.io/posts/oklab/ */
function oklchToLinearRgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** 相対輝度。色域外はブラウザの表示に合わせて sRGB にクリップしてから計算する */
function luminance(color) {
  const [r, g, b] = oklchToLinearRgb(...color).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

function toHex(color) {
  const enc = (v) => {
    const c = clamp01(v);
    const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(s * 255).toString(16).padStart(2, "0");
  };
  return "#" + oklchToLinearRgb(...color).map(enc).join("");
}

function parseOklch(text) {
  const m = text.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return null;
  const L = m[1].endsWith("%") ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  return [L, parseFloat(m[2]), parseFloat(m[3])];
}

/* ── トークンの読み取り ──────────────────────────────────── */

/** CSS からトップレベルのカスタムプロパティ宣言を集める */
function readTokens() {
  const tokens = new Map();
  for (const file of SOURCES) {
    const css = readFileSync(join(ROOT, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
      if (!tokens.has(m[1])) tokens.set(m[1], m[2].trim().replace(/\s+/g, " "));
    }
  }
  return tokens;
}

/** トークン名をテーマごとの OKLCH 値へ解決する。theme は "light" | "dark" */
function resolve(tokens, name, theme, seen = new Set()) {
  if (seen.has(name)) throw new Error(`循環参照: ${name}`);
  seen.add(name);

  const raw = tokens.get(name);
  if (raw === undefined) throw new Error(`未定義のトークン: ${name}`);

  // light-dark(a, b) — 括弧の対応を見て第1引数と第2引数に分ける
  if (raw.startsWith("light-dark(")) {
    const inner = raw.slice("light-dark(".length, raw.lastIndexOf(")"));
    let depth = 0;
    let split = -1;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === "(") depth++;
      else if (inner[i] === ")") depth--;
      else if (inner[i] === "," && depth === 0) { split = i; break; }
    }
    const arm = (theme === "dark" ? inner.slice(split + 1) : inner.slice(0, split)).trim();
    return resolveValue(tokens, arm, theme, seen);
  }

  return resolveValue(tokens, raw, theme, seen);
}

function resolveValue(tokens, value, theme, seen) {
  const ref = value.match(/^var\(\s*(--[a-zA-Z0-9-]+)\s*\)$/);
  if (ref) return resolve(tokens, ref[1], theme, new Set(seen));
  if (value.startsWith("light-dark(")) {
    const tmp = "--__inline__";
    return resolve(new Map(tokens).set(tmp, value), tmp, theme, new Set(seen));
  }
  const color = parseOklch(value);
  if (!color) throw new Error(`OKLCH として読めない値: ${value}`);
  return color;
}

/* ── 検証したい組み合わせ ────────────────────────────────── */

const AA_TEXT = 4.5;   // WCAG 1.4.3 通常の文字
const AA_UI = 3.0;     // WCAG 1.4.11 非テキスト（枠線・UI部品）

const CHECKS = [
  ["本文",              "--ink",            "--ground",  AA_TEXT],
  ["本文 / 面",          "--ink",            "--surface", AA_TEXT],
  ["補助的な文字",        "--ink-muted",      "--ground",  AA_TEXT],
  ["補助的な文字 / 面",    "--ink-muted",      "--surface", AA_TEXT],
  ["リンク",             "--link",           "--ground",  AA_TEXT],
  ["リンク / 面",         "--link",           "--surface", AA_TEXT],
  ["カードの輪郭",        "--edge",           "--surface", AA_UI],
  ["カードの輪郭 / 地",    "--edge",           "--ground",  AA_UI],
  ["ヘッダーの文字",       "--color-header-foreground", "--color-header-background", AA_TEXT],
  ["ツールチップの文字",    "--on-inverse",     "--inverse", AA_TEXT],
  ["アクセント上の文字",    "--on-accent",      "--accent",  AA_TEXT],
  ["タグの文字",          "--color-tag-foreground", "--color-tag-background", AA_TEXT],
  /* ライムに接する前景。ライトでは --ink ≒ --on-accent で偶然通るため、
     地や面を背景にして検査するとダーク側の破綻を取りこぼす */
  ["記事タイトル / 輪郭",   "--post-title-color", "--accent",  AA_TEXT],
  ["目次の選択項目",       "--toc-selected-item-color", "--color-primary", AA_TEXT],
  ["年別リンクのホバー",    "--on-accent",      "--color-primary", AA_TEXT],
  ["引用の文字",          "--color-blockquote-fg", "--color-blockquote-bg", AA_TEXT],
  ["インラインコード",     "--color-code-inline-fg", "--color-code-inline-bg", AA_TEXT],
  ["カードのホバー面",      "--ink",            "--color-card-background-hover", AA_TEXT],
  ["トグルのつまみ",       "--color-toggle-knob", "--color-toggle-bg", AA_UI],
  ["区切り線",           "--rule",           "--ground",  1.3],
  ["吹き出しの文字",       "--speech-bubble-fg", "--speech-bubble-bg", AA_TEXT],
];

/**
 * 相補構造。塗りが地に沈むなら輪郭が形を定義する（その逆も同じ）。
 * どちらか一方が地に対して 3:1 を満たしていればよい。
 * 両方沈むと形が定義されなくなる。カードのダークが実際にそうなっていた
 * （塗り 1.22 / 輪郭 1.36）ので、表明として固定しておく。
 */
const COMPLEMENTARY = [
  ["ヘッダー", "--color-header-background", "--color-header-border"],
  ["カード", "--color-card-background", "--color-card-border"],
  ["吹き出し", "--speech-bubble-bg", "--speech-bubble-border"],
];

/* 影は「常に地より暗い」ことだけを検証する。比の大小は問わない */
const SHADOW_CHECKS = [["影", "--shadow", "--ground"]];

/* ── 実行 ───────────────────────────────────────────────── */

const tokens = readTokens();
let failed = 0;

for (const theme of ["light", "dark"]) {
  console.log(`\n  ${theme === "light" ? "ライト" : "ダーク"}`);
  console.log("  " + "─".repeat(62));

  for (const [label, fg, bg, min] of CHECKS) {
    const a = resolve(tokens, fg, theme);
    const b = resolve(tokens, bg, theme);
    const r = contrast(a, b);
    const ok = r >= min;
    if (!ok) failed++;
    const gamut = inGamut(oklchToLinearRgb(...a)) ? "" : "  ⚠ sRGB 色域外";
    console.log(
      `  ${ok ? "✓" : "✗"} ${label.padEnd(20)}` +
      `${r.toFixed(2).padStart(6)} / ${min.toFixed(1)}  ` +
      `${toHex(a)} on ${toHex(b)}${gamut}`,
    );
  }

  for (const [label, fill, edge] of COMPLEMENTARY) {
    const g = resolve(tokens, "--ground", theme);
    const rFill = contrast(resolve(tokens, fill, theme), g);
    const rEdge = contrast(resolve(tokens, edge, theme), g);
    const ok = Math.max(rFill, rEdge) >= AA_UI;
    if (!ok) failed++;
    const who = rFill >= rEdge ? "塗り" : "輪郭";
    console.log(
      `  ${ok ? "✓" : "✗"} ${(label + "の形").padEnd(20)}` +
      `${who} ${Math.max(rFill, rEdge).toFixed(2).padStart(5)} / ${AA_UI.toFixed(1)}  ` +
      `（塗り ${rFill.toFixed(2)} / 輪郭 ${rEdge.toFixed(2)}）`,
    );
  }

  for (const [label, fg, bg] of SHADOW_CHECKS) {
    const a = resolve(tokens, fg, theme);
    const b = resolve(tokens, bg, theme);
    const darker = luminance(a) < luminance(b);
    if (!darker) failed++;
    console.log(
      `  ${darker ? "✓" : "✗"} ${label.padEnd(20)}` +
      `${darker ? "地より暗い" : "地より明るい（影は必ず地より暗い）"}`.padStart(6),
    );
  }
}

/* 面は常に地より明るいこと（仕様書 01） */
console.log("\n  構造");
console.log("  " + "─".repeat(62));
for (const theme of ["light", "dark"]) {
  const lighter = luminance(resolve(tokens, "--surface", theme)) >
                  luminance(resolve(tokens, "--ground", theme));
  if (!lighter) failed++;
  console.log(`  ${lighter ? "✓" : "✗"} 面が地より明るい（${theme}）`);
}

console.log(
  failed === 0
    ? "\n  すべて基準を満たしている\n"
    : `\n  ${failed} 件が基準を満たしていない\n`,
);
process.exit(failed === 0 ? 0 : 1);
