import { useState, useLayoutEffect } from 'hono/jsx'
import { MoonIcon } from "@/components/ui/MoonIcon";
import { SunIcon } from "@/components/ui/SunIcon";
import { css } from 'hono/css';

type Theme = 'light' | 'dark'

const themeToggleClass = css`
  position: relative;
  display: flex;
  align-items: center;
  width: fit-content;
  height: fit-content;
  cursor: pointer;
  border-radius: var(--round-pill);
`

const toggleSwitchClass = css`
  --toggle-switch-size: var(--size-1000);
  appearance: none;
  outline: none;
  margin: 0;
  display: inline-block;
  width: calc(var(--toggle-switch-size) * 1.9);
  height: var(--toggle-switch-size);
  border-radius: var(--round-pill);
  background-color: var(--color-neutral-800);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.8);
  cursor: inherit;

  @media (hover: hover) {
    &:hover {
      box-shadow: inset 0 0 2px var(--color-primary);
    }
  }
  
  &::before {
    content: "";
    display: block;
    width: var(--toggle-switch-size);
    height: var(--toggle-switch-size);
    transform: scale(0.75);
    background-color: var(--color-neutral-600);
    box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  &:checked::before {
    content: "";
    transform: translateX(calc(var(--toggle-switch-size) * .9)) scale(0.75);
  }
`

const toggleIconClass = css`
  position: absolute;
  top: 17.5%;
  transition: opacity .2s;
  
  &[data-icon="sun"] {
    left: 10%;
  }

  &[data-icon="moon"] {
    right: 10%;
  }

  &[data-hidden="true"]{
    opacity: 0;
  }
`

export function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useLayoutEffect(() => {
    // 初期表示時にクッキーやデータ属性からテーマを取得
    const savedTheme = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme='))
      ?.split('=')[1] as Theme | undefined;

    const currentTheme = savedTheme || document.documentElement.dataset.theme || 'light';
    setTheme(currentTheme as Theme);

    // HTML要素にテーマを適用
    document.documentElement.dataset.theme = currentTheme;
    document.documentElement.className = currentTheme === 'dark' ? 'dark' : '';
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    document.cookie = `theme = ${newTheme}; path =/; max-age=31536000; SameSite=Lax`
    setTheme(newTheme)

    // 既存のダークモード切り替えロジックを保持
    document.documentElement.dataset.theme = newTheme
    document.documentElement.className = newTheme === 'dark' ? 'dark' : ''
  }

  return (
    <>
      <label class={themeToggleClass}>
        <input type="checkbox" class={toggleSwitchClass} aria-label="ダークモード切替" onChange={toggleTheme} checked={theme === "light"} />
        <span class={toggleIconClass} data-icon="moon" data-hidden={theme === "light" ? "true" : "false"}>
          <MoonIcon />
        </span>
        <span class={toggleIconClass} data-icon="sun" data-hidden={theme === "dark" ? "true" : "false"}>
          <SunIcon color="var(--color-primary)" />
        </span>
      </label>
    </>
  )
}
