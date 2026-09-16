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

/** `<head>` に同期スクリプトとして置く。ハイドレーションには依存しない */
export const THEME_INIT_SCRIPT = `(function () {
  var KEY = "theme", SEL = "[data-theme-option]";
  var root = document.documentElement, current = "system";

  try { current = localStorage.getItem(KEY); } catch (e) {}

  if (current !== "system" && current !== "light" && current !== "dark") {
    current = "system";
    try {
      // 旧 cookie 方式（#78 以前）の選択を一度だけ引き継いで捨てる
      var cookie = document.cookie.match(/(?:^|;\\s*)theme=(light|dark)/);
      if (cookie) current = cookie[1];
      document.cookie = "theme=; Max-Age=0; Path=/";
      localStorage.setItem(KEY, current);
    } catch (e) {}
  }

  function apply(choice) {
    current = choice;
    // system は属性を付けない。color-scheme: light dark の解決に委ねる
    if (choice === "system") delete root.dataset.theme;
    else root.dataset.theme = choice;

    // サーバは閲覧者の選択を知り得ないので aria-pressed はここで付ける
    var buttons = document.querySelectorAll(SEL);
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-theme-option") === choice));
    }
  }

  apply(current); // <head> の時点ではボタンがまだ無いので data-theme だけ付く

  document.addEventListener("click", function (e) {
    var button = e.target.closest && e.target.closest(SEL);
    if (!button) return;
    apply(button.getAttribute("data-theme-option"));
    try { localStorage.setItem(KEY, current); } catch (e) {}
  });

  document.addEventListener("DOMContentLoaded", function () { apply(current); });
})();`;
