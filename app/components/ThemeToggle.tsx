import { css } from "hono/css";
import { DisplayIcon } from "@/components/ui/DisplayIcon";
import { MoonIcon } from "@/components/ui/MoonIcon";
import { SunIcon } from "@/components/ui/SunIcon";
import { THEME_CHOICES, THEME_LABELS, type ThemeChoice } from "@/lib/theme";

// ─── Types ───────────────────────────────────────────────────────────────────

type IconProps = { color?: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ICONS: Record<ThemeChoice, (props: IconProps) => any> = {
  system: DisplayIcon,
  light: SunIcon,
  dark: MoonIcon,
};

// ─── Styles ──────────────────────────────────────────────────────────────────

/**
 * 色は一切ここに書かない。どのセグメントが選択中かは `:root[data-theme]` を見て
 * components.css が出し分ける。非レイヤーの hono/css はレイヤーに勝つため、
 * ここで color / background-color を宣言すると出し分けが効かなくなる。
 */
const switchGroupClass = css`
  display: inline-flex;
  align-items: center;
  gap: var(--theme-switch-gap);
  padding: var(--theme-switch-padding);
  border-radius: var(--round-pill);
`;

const switchButtonClass = css`
  display: grid;
  place-items: center;
  width: var(--theme-switch-button-size);
  height: var(--theme-switch-button-size);
  padding: 0;
  border: none;
  border-radius: var(--round-circle);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard);

  & svg {
    width: var(--theme-switch-icon-size);
    height: var(--theme-switch-icon-size);
  }

  &:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * システム / ライト / ダークの3状態。
 *
 * island ではない。クリックは `<head>` の `THEME_INIT_SCRIPT` が document で
 * 委譲して受ける（理由は app/lib/theme.ts のコメント）。押下時に localStorage と
 * `data-theme` を書き換えるだけなので、画面の再読み込みは起きない。
 *
 * `aria-pressed` はサーバでは書けない（閲覧者の選択を知り得ない）。同スクリプトが
 * DOMContentLoaded で付ける。見た目の選択状態は CSS が `data-theme` から引くので、
 * 初回描画の時点で既に正しい。
 */
export function ThemeToggle() {
  return (
    <div class={switchGroupClass} role="group" aria-label="テーマ">
      {THEME_CHOICES.map((value) => {
        const Icon = ICONS[value];
        return (
          <button
            type="button"
            class={switchButtonClass}
            data-theme-option={value}
            aria-label={THEME_LABELS[value]}
            title={THEME_LABELS[value]}
          >
            <Icon color="currentColor" />
          </button>
        );
      })}
    </div>
  );
}
