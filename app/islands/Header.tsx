import { useState, useEffect } from "hono/jsx";
import { ThemeToggle } from "@/islands/ThemeToggle";
import { css } from "hono/css";
import HamburgerIcon from "@/components/ui/HamburgerIcon";

type Theme = 'light' | 'dark';

const headerClass = css`
  background-color: var(--color-header-background);
  color: var(--color-header-foreground);
  max-width: var(--content-max-width);
  z-index: 50;
  border: var(--header-border);
  position: fixed;
  top: var(--spacing-base);
  left: 0;
  right: 0;
  margin-inline: auto;
  border-radius: var(--round-lg);
  padding: var(--spacing-base) var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition:
    transform var(--duration-slow) var(--ease-standard),
    opacity var(--duration-slow) var(--ease-standard);

  @media (max-width: 1100px) {
    margin-inline: var(--spacing-lg);
  }

  @media (max-width: 768px) {
    margin-inline: var(--spacing-sm);
  }
`

const navClass = css`
  display: flex;
  align-items: center;
  gap: 3rem;
  flex: 1;

  & a:hover {
    transition: color var(--duration-instant);
  }
`

const blandLinkClass = css`
  font-size: var(--text-lg);
  font-weight: bold;
  letter-spacing: -0.025em;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 3px;
    background-color: var(--color-primary);
    transition: width var(--duration-slow);
  }

  &:hover {
    opacity: 0.8;
    transition: opacity var(--duration-base) var(--ease-standard);
  }

  &:hover::after {
    width: 100%;
  }

  &[data-current="true"]::after {
    width: 100%;
  }
`

const navLinkListClass = css`
  display: flex;
  gap: var(--spacing-lg-xl);
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  width: 100%;

  @media (min-width: 580px) {
    & li:nth-last-child(2) {
      margin-left: auto;
    }

    & li:last-child {
      display: none;
    }
  }

  @media (max-width: 579px) {
    & li:not(:last-child) {
      display: none;
    }

    & li:last-child {
      display: flex;
      align-items: center;
      margin-left: auto;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding-bottom: 2px;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 0;
      height: 3px;
      background-color: var(--color-primary);
      transition: width var(--duration-slow);
    }

    &:hover {
      opacity: 0.8;
      transition: opacity var(--duration-base) var(--ease-standard);
    }

    &:hover::after {
      width: 100%;
    }

    &[data-current="true"]::after {
      width: 100%;
    }
  }
`

const hamburgerButtonClass = css`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  height: 100%;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) {
    &:hover {
      transition: transform var(--duration-base) var(--ease-standard);
      transform: scale(1.1);

      & svg path {
        fill: var(--color-primary);
        transition: fill var(--duration-base) var(--ease-standard);
      }
    }
  }
`

export const Header = ({ initialTheme, currentPath }: { initialTheme: Theme, currentPath: string }) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 300) {
        setVisible(true);
      } else {
        setVisible(currentY < lastScrollY)
      }

      setLastScrollY(currentY);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);

  }, [lastScrollY])

  const visibilityStyles = {
    transform: `${visible ? 'translateY(0)' : 'translateY(-5rem)'}`,
    opacity: visible ? '1' : '0'
  }

  return (
    <header
      class={headerClass}
      style={visibilityStyles}
    >
      <nav class={navClass}>
        <a href="/" class={blandLinkClass} data-current={currentPath === '/' ? 'true' : 'false'}>
          hiraaaken.dev
        </a>
        <ul class={navLinkListClass}>
          <li><a href="/posts" data-current={currentPath.startsWith('/posts') ? 'true' : 'false'}>Posts</a></li>
          <li><a href="/tags" data-current={currentPath.startsWith('/tags') ? 'true' : 'false'}>Tags</a></li>
          <li><a href="/about" data-current={currentPath.startsWith('/about') ? 'true' : 'false'}>About</a></li>
          <li>
            <ThemeToggle initialTheme={initialTheme} />
          </li>
          <li>
            <button class={hamburgerButtonClass} aria-label="Open menu">
              <HamburgerIcon />
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
