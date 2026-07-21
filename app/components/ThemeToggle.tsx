import { MoonIcon } from "@/components/ui/MoonIcon";
import { SunIcon } from "@/components/ui/SunIcon";
import { css } from "hono/css";

type Theme = "light" | "dark";

const themeToggleFormClass = css`
  display: flex;
`

const themeToggleClass = css`
  --_size: var(--toggle-size);
  position: relative;
  display: inline-flex;
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
    translate: calc(var(--_size) * 0.9) 0;
    transition: translate var(--duration-slow) var(--ease-bounce);
  }

  &[aria-checked="true"]::before {
    translate: 0 0;
  }
  &[aria-checked="true"] [data-icon="sun"] {
    opacity: 0;
  }
  &[aria-checked="false"] [data-icon="moon"] {
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

export function ThemeToggle({ theme }: { theme: Theme }) {

  return (
    <form action="/theme" method="post" class={themeToggleFormClass}>
      <button 
        type="submit" 
        class={themeToggleClass}
        role="switch"
        aria-checked={theme === "dark" ? "true" : "false"}
        aria-label="Toggle Theme"
      >
        <span
          class={toggleIconClass}
          data-icon="moon"
        >
          <MoonIcon />
        </span>
        <span
          class={toggleIconClass}
          data-icon="sun"
        >
          <SunIcon color="var(--color-primary)" />
        </span>
      </button>
    </form>
  );
}
