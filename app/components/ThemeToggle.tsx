import { MoonIcon } from "@/components/ui/MoonIcon";
import { SunIcon } from "@/components/ui/SunIcon";
import { css } from "hono/css";

const themeToggleFormClass = css`
  display: flex;
`

/**
 * 切り替え先を明示して送る。cookie が無い状態ではサーバは表示中のテーマを
 * 知り得ないので、出し分けは CSS 側（components.css）に任せる。
 * display をここで宣言すると非レイヤーの hono/css がそれに勝つため書かない。
 */
const themeToggleClass = css`
  --_size: var(--toggle-size);
  position: relative;
  align-items: center;
  width: calc(var(--_size) * 1.9);
  height: var(--_size);
  padding: 0;
  border: none;
  border-radius: var(--round-pill);
  background-color: var(--color-toggle-bg);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    z-index: 1;
    width: var(--_size);
    height: var(--_size);
    scale: 0.75;
    border-radius: var(--round-circle);
    background-color: var(--color-toggle-knob);
    transition: translate var(--duration-slow) var(--ease-bounce);
  }

  /* 切り替え先がダーク＝今はライト表示 */
  &[data-to="dark"]::before {
    translate: calc(var(--_size) * 0.9) 0;
  }
  &[data-to="dark"] [data-icon="moon"] {
    opacity: 0;
  }

  /* 切り替え先がライト＝今はダーク表示 */
  &[data-to="light"]::before {
    translate: 0 0;
  }
  &[data-to="light"] [data-icon="sun"] {
    opacity: 0;
  }

  @media (hover: hover) {
    &:hover { box-shadow: inset 0 0 2px var(--color-primary); }
  }
`;

const toggleIconClass = css`
  position: absolute;
  display: flex;
  &[data-icon="sun"] {
    left: 8%;
  }
  &[data-icon="moon"]{
    right: 8%;
  }
`;

type ThemeSwitchProps = {
  to: "light" | "dark";
  label: string;
};

function ThemeSwitch({ to, label }: ThemeSwitchProps) {
  return (
    <button
      type="submit"
      name="to"
      value={to}
      data-to={to}
      class={themeToggleClass}
      aria-label={label}
    >
      <span class={toggleIconClass} data-icon="moon">
        <MoonIcon />
      </span>
      <span class={toggleIconClass} data-icon="sun">
        <SunIcon color="var(--color-primary)" />
      </span>
    </button>
  );
}

export function ThemeToggle() {
  return (
    <form action="/theme" method="post" class={themeToggleFormClass}>
      <ThemeSwitch to="dark" label="ダークテーマに切り替える" />
      <ThemeSwitch to="light" label="ライトテーマに切り替える" />
    </form>
  );
}
