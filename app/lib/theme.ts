/**
 * テーマの3状態と、それが `data-theme` へどう写るか。
 *
 * 正は localStorage ただ一つ。cookie を使っていた頃は、SSG された `/` `/posts`
 * `/tags` `/about` が Workers Assets に先取りされて Worker が起動せず、
 * `getCookie` が一度も実行されないため切り替えが効かなかった。
 * 静的ページでも動的ページでも同じように読める場所は localStorage しかない。
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export const THEME_CHOICES = ["system", "light", "dark"] as const;

export type ThemeChoice = (typeof THEME_CHOICES)[number];

/** `data-theme` 属性の値。null は「属性を付けない」＝システム設定に従う */
export type ThemeAttribute = "light" | "dark" | null;

// ─── Constants ───────────────────────────────────────────────────────────────

export const THEME_STORAGE_KEY = "theme";

/** `aria-pressed` を持つボタンの名前は、動作ではなく状態を指す語にする */
export const THEME_LABELS: Record<ThemeChoice, string> = {
  system: "システム設定に従う",
  light: "ライト",
  dark: "ダーク",
};

// ─── Pure functions ──────────────────────────────────────────────────────────

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return THEME_CHOICES.includes(value as ThemeChoice);
}

/**
 * 3状態 → `data-theme`。system だけが「属性を付けない」に写る。
 * 属性が無い状態は `color-scheme: light dark` の解決に委ねられ、
 * `light-dark()` で書いたトークンがそのまま OS 設定に追従する。
 */
export function themeAttribute(choice: ThemeChoice): ThemeAttribute {
  return choice === "system" ? null : choice;
}

/** 保存値の読み取り。未設定・壊れた値はすべて system に倒す */
export function normalizeThemeChoice(value: unknown): ThemeChoice {
  return isThemeChoice(value) ? value : "system";
}

// ─── Client ──────────────────────────────────────────────────────────────────

/**
 * `<head>` に同期スクリプトとして置く。役割は3つ。
 *
 *   1. 描画前に `data-theme` を確定させる（FOUC 回避）
 *   2. `[data-theme-option]` のクリックを document で委譲して受ける
 *   3. `aria-pressed` を選択状態に合わせる
 *
 * **island にしていない理由。** HonoX（honox 0.1.x）は1ページにつき最初の island
 * しか `<honox-island>` で包まない。ヘッダーの切り替えを island にすると、それが
 * 常に「最初の island」になり、`/about` の TechStackTag などが巻き添えで死ぬ。
 * ハンバーガー内にもう一つ置いている切り替えも、2つ目なのでハイドレートされない。
 * クリックを document で委譲すれば、ハイドレーションに一切依存せず両方が動く。
 *
 * 旧 cookie 方式の値は一度だけ引き継いでから捨てるので、既に選択済みの閲覧者の
 * 設定は失われない。
 */
export const THEME_INIT_SCRIPT = `(function(){
var KEY=${JSON.stringify(THEME_STORAGE_KEY)},SEL="[data-theme-option]",root=document.documentElement;
function normalize(v){return v==="light"||v==="dark"||v==="system"?v:null;}
function read(){try{return normalize(localStorage.getItem(KEY));}catch(e){return null;}}
function save(c){try{localStorage.setItem(KEY,c);}catch(e){}}
function migrate(){try{
var m=document.cookie.match(/(?:^|;\\s*)theme=(light|dark)/);
document.cookie="theme=; Max-Age=0; Path=/";
return m?m[1]:null;
}catch(e){return null;}}
function paint(c){if(c==="light"||c==="dark"){root.dataset.theme=c;}else{delete root.dataset.theme;}}
function announce(c){
var n=document.querySelectorAll(SEL);
for(var i=0;i<n.length;i++){n[i].setAttribute("aria-pressed",String(n[i].getAttribute("data-theme-option")===c));}
}
var current=read();
if(current===null){current=migrate()||"system";save(current);}
paint(current);
document.addEventListener("click",function(e){
var t=e.target,b=t&&t.closest?t.closest(SEL):null;
if(!b)return;
var next=normalize(b.getAttribute("data-theme-option"));
if(!next)return;
current=next;save(next);paint(next);announce(next);
});
document.addEventListener("DOMContentLoaded",function(){announce(current);});
})();`;
