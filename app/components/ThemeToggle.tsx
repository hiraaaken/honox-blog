import { css } from "hono/css";
import { DisplayIcon } from "@/components/ui/DisplayIcon";
import { MoonIcon } from "@/components/ui/MoonIcon";
import { SunIcon } from "@/components/ui/SunIcon";
import { DEFAULT_THEME_CHOICE, THEME_CHOICES, type ThemeChoice } from "@/lib/theme";

const ICONS: Record<ThemeChoice, (props: { color?: string }) => any> = {
  system: DisplayIcon,
  light: SunIcon,
  dark: MoonIcon,
};

/** 色は components.css が持つ。非レイヤーの hono/css で宣言すると出し分けに勝ってしまう */
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

/**
 * island ではない。クリックも矢印キーも radio の状態も、`<head>` の
 * THEME_INIT_SCRIPT が document で委譲して受ける。
 * 選択中の見た目は `:root[data-theme]` から CSS が引く。
 *
 * サーバは閲覧者の選択を知り得ないので、既定（system）を選択中として描く。
 * 別の値を保存している閲覧者の分はスクリプトが読み込み時に直す。
 */
export function ThemeToggle() {
  return (
    <div class={switchGroupClass} role="radiogroup" aria-label="テーマ">
      {THEME_CHOICES.map(({ value, label }) => {
        const Icon = ICONS[value];
        const selected = value === DEFAULT_THEME_CHOICE;
        return (
          <button
            type="button"
            role="radio"
            class={switchButtonClass}
            data-theme-option={value}
            aria-checked={selected ? "true" : "false"}
            aria-label={label}
            title={label}
            tabindex={selected ? 0 : -1}
          >
            <Icon color="currentColor" />
          </button>
        );
      })}
    </div>
  );
}
