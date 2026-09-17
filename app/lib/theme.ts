/**
 * テーマの3状態。正は localStorage ただ一つ。
 * 背景と制約は .claude/rules/design-system.md の「テーマ」を見る。
 */

export const THEME_CHOICES = [
  { value: "system", label: "システム設定に従う" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
] as const;

export type ThemeChoice = (typeof THEME_CHOICES)[number]["value"];

/**
 * `<head>` に同期スクリプトとして置く。ハイドレーションには依存しない。
 *
 * `type="module"` にはできない。モジュールは常に defer されるため描画前に走らず、
 * ちらつきを防げない（`scripts/theme.check.mjs` の前提）。
 *
 * グローバルは `document` と `window` だけを触る。検査が偽 DOM を差し込めるように、
 * `localStorage` や `matchMedia` も裸で参照せず `window.` を経由する。
 */
export const THEME_INIT_SCRIPT = `{
  const KEY = "theme";
  const SEL = "[data-theme-option]";
  const VALUES = ${JSON.stringify(THEME_CHOICES.map((c) => c.value))};
  const root = document.documentElement;

  // 未設定も壊れた値も system。既定を書き戻さないので、触らない閲覧者には何も保存しない
  let current = "system";
  try {
    const stored = window.localStorage.getItem(KEY);
    if (VALUES.includes(stored)) current = stored;
  } catch {}

  /** DOM への反映だけを行う。状態の更新は apply() が同期で済ませている */
  const paint = (choice) => {
    // system は属性を付けない。color-scheme: light dark の解決に委ねる
    if (choice === "system") delete root.dataset.theme;
    else root.dataset.theme = choice;

    // サーバは閲覧者の選択を知り得ないので radio の状態はここで確定させる。
    // タブストップはグループ全体で1つに畳む（roving tabindex）
    for (const radio of document.querySelectorAll(SEL)) {
      const selected = radio.dataset.themeOption === choice;
      radio.setAttribute("aria-checked", String(selected));
      radio.tabIndex = selected ? 0 : -1;
    }
  };

  const apply = (choice) => {
    // View Transition の callback は次フレームなので、状態はここで同期に確定させる。
    // でないと連打したとき2回目が古い current から計算してしまう
    current = choice;
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      document.startViewTransition(() => paint(choice));
    else paint(choice);
  };

  /** この閲覧者自身の選択。別タブ発の変更は保存しないので apply() と分けている */
  const select = (choice) => {
    apply(choice);
    try { window.localStorage.setItem(KEY, choice); } catch {}
  };

  paint(current); // <head> の時点ではボタンがまだ無いので data-theme だけ付く

  document.addEventListener("click", (e) => {
    const radio = e.target.closest?.(SEL);
    if (radio && radio.dataset.themeOption !== current) select(radio.dataset.themeOption);
  });

  // radiogroup は矢印キーでフォーカスと選択が同時に動く
  document.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    const radio = e.target.closest?.(SEL);
    if (!radio) return;
    e.preventDefault();
    const next = VALUES[(VALUES.indexOf(current) + step + VALUES.length) % VALUES.length];
    select(next);
    radio.closest('[role="radiogroup"]')?.querySelector(\`[data-theme-option="\${next}"]\`)?.focus();
  });

  // 別タブでの変更に追従する。localStorage への書き込みは他タブにだけ届く
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    const next = VALUES.includes(e.newValue) ? e.newValue : "system";
    if (next !== current) apply(next);
  });

  document.addEventListener("DOMContentLoaded", () => paint(current));
}`;
