import { useState, useEffect } from "hono/jsx";
import { ThemeToggle } from "@/islands/ThemeToggle";
import { css } from "hono/css";
import HamburgerIcon from "@/components/ui/HamburgerIcon";
import CloseIcon from "@/components/ui/CloseIcon";

type Theme = 'light' | 'dark';

const headerClass = css`
  background-color: var(--color-header-background);
  color: var(--color-header-foreground);
  max-width: var(--content-max-width);
  z-index: 50;
  border: var(--header-border);
  anchor-name: --header;
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
    transform 0.3s ease-in-out,
    opacity 0.3s ease-in-out,
    border-bottom-right-radius 0.65s ease-in-out;

  &:has(:popover-open) {
    border-bottom-right-radius: 0;
    transition:
      transform 0.3s ease-in-out,
      opacity 0.3s ease-in-out,
      border-bottom-right-radius 0s;
  }

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
    transition: color 0.1s;
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
    transition: width 0.3s ease;
  }
  
  &:hover {
    opacity: 0.8;
    transition: opacity 0.2s ease-in-out;
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
      transition: width 0.3s ease;
    }

    &:hover {
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;
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
  margin: 0 auto;
  display: grid;
  place-items: center;
  height: 100%;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  & > span {
    grid-area: 1 / 1;
  }

  @media (hover: hover) {
    &:hover {
      transition: transform 0.2s ease-in-out, fill 0.2s ease-in-out;
      transform: scale(1.1);

      & > span > svg > path {
        fill: var(--color-primary);
      }
    }
  }
`

const hamburgerIconClass = css`
  display: flex;
  opacity: 1;
  rotate: 0deg;
  transition: opacity 0.3s ease-out, rotate 0.3s ease-out;

  header:has(:popover-open) & {
    opacity: 0;
    rotate: 180deg;
  }
`

const closeIconClass = css`
  display: flex;
  opacity: 0;
  rotate: -180deg;
  transition: opacity 0.3s ease-out, rotate 0.3s ease-out;

  header:has(:popover-open) & {
    opacity: 1;
    rotate: 0deg;
  }
`

const hamburgerMenuClass = css`
  background-color: var(--color-header-background);
  color: var(--color-header-foreground);
  border: var(--header-border);
  border-top: none;
  border-radius: 0 0 var(--round-md) var(--round-md);
  padding: 0;
  margin: 0;
  inset: unset;
  position-anchor: --header;
  top: anchor(--header bottom);
  left: calc(100% - 140px);
  margin-top: calc(-1 * var(--border-width-thick));
  width: 140px;

  @media (max-width: 1100px) {
    left: calc(100% - 140px - var(--spacing-lg));
  }

  @media (max-width: 768px) {
    left: calc(100% - 140px - var(--spacing-sm));
  }

  opacity: 1;
  clip-path: inset(0 0 100% 0);

  transition-property: clip-path, display, overlay;
  transition-duration: 0.35s;
  transition-timing-function: ease-in-out;
  transition-behavior: normal, allow-discrete, allow-discrete;

  &:popover-open {
    clip-path: inset(0 0 0 0);

    @starting-style {
      clip-path: inset(0 0 100% 0);
    }
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    font-size: clamp(var(--text-md), 2.5vw, var(--text-lg));
    font-weight: var(--font-semibold);
    margin: auto 0;

    & a {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 3px;
        background-color: var(--color-primary);
        transition: width 0.3s ease;
      }

      &:hover {
        opacity: 0.8;
        transition: opacity 0.2s ease-in-out;
      }

      &:hover::after {
        width: 100%;
      }
    }
  }
`

export const Header = ({ initialTheme, currentPath }: { initialTheme: Theme, currentPath: string }) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 580px)');
    const handleBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) {
        const menu = document.getElementById('menu');
        if (menu?.matches(':popover-open')) {
          menu.hidePopover();
        }
      }
    };
    mq.addEventListener('change', handleBreakpoint);
    return () => mq.removeEventListener('change', handleBreakpoint);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 300) {
        setVisible(true);
      } else {
        setVisible(currentY < lastScrollY)
      }

      setLastScrollY(currentY);

      if (currentY >= 300 && currentY > lastScrollY) {
        const menu = document.getElementById('menu2');
        if (menu?.matches(':popover-open')) {
          menu.hidePopover();
        }
      }
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
            <button popovertarget="menu" class={hamburgerButtonClass} aria-label="Open menu">
              <span class={hamburgerIconClass}><HamburgerIcon /></span>
              <span class={closeIconClass}><CloseIcon /></span>
            </button>
          </li>
        </ul>
      </nav>

      <aside popover="auto" id="menu" class={hamburgerMenuClass}>
        <ul>
          <li>
            <a href="/posts" data-current={currentPath.startsWith('/posts') ? 'true' : 'false'}>Posts</a></li>
          <li><a href="/tags" data-current={currentPath.startsWith('/tags') ? 'true' : 'false'}>Tags</a></li>
          <li><a href="/about" data-current={currentPath.startsWith('/about') ? 'true' : 'false'}>About</a></li>
          <ThemeToggle initialTheme={initialTheme} />
        </ul>
      </aside>
    </header >
  )
}
