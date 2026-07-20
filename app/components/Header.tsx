import { ThemeToggle } from "@/components/ThemeToggle";
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
  translate: 0 0;
  transition:
    transform var(--duration-slow) var(--ease-standard),
    opacity var(--duration-slow) var(--ease-standard),
    border-bottom-right-radius var(--duration-panel) var(--ease-standard),
    translate var(--duration-slow) var(--ease-standard);

  &:has(:popover-open) {
    translate: 0 0;
    opacity: 1;
  }

  @media (max-width: 1100px) {
    margin-inline: var(--spacing-lg);
  }

  @media (max-width: 768px) {
    margin-inline: var(--spacing-sm);
  }

  @container style(--scroll-direction: 1) and style(--past-threshold: 1) {
    & {
      translate: 0 calc(-100% - var(--spacing-base));
      opacity: 0;
    }
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
  display: grid;
  place-items: center;
  margin: 0 auto;
  height: 100%;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) {
    &:hover {
      transition: transform var(--duration-base) var(--ease-standard);

      & svg path {
        fill: var(--color-primary);
        transition: fill var(--duration-base) var(--ease-standard);
      }
    }
  }
`

const hamburgerMenuClass = css`
  inset: 0 0 0 auto;
  margin: 0;
  padding: 0;
  width: var(--drawer-width);
  height: 100dvh;
  max-height: none;
  box-shadow: var(--shadow-lg);
  background-color: var(--color-hamburger-background);
  color: var(--color-hamburger-foreground);
  border-radius: var(--round-lg) 0 0 var(--round-lg);
  border: var(--border-hamburger);

  translate: 100% 0;
  transition:
    translate var(--duration-spring) var(--ease-spring),
    display var(--duration-spring) allow-discrete,
    overlay var(--duration-spring) allow-discrete;

  position-area: none;

  &:popover-open {
    display: flex;
    translate: 0 0;
    @starting-style {
      translate: 100% 0;
    }
  }

  flex-direction: column;
  gap: var(--spacing-lg);
  padding: calc(var(--spacing-2xl) + var(--spacing-lg)) var(--spacing-lg) var(--spacing-lg);

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);

    a {
      color: inherit;
      text-decoration: none;
      position: relative;
      display: inline-block;

      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -1px;
        width: 0;
        height: 3px;
        background-color: var(--color-primary);
        transition: width var(--duration-slow);
      }

      &[data-current="true"]::after {
        width: 100%;
      }

      @media (hover: hover) {
        &:hover::after {
          width: 100%;
        }
      }
    }
  }
`

const drawerCloseClass = css`
  color: inherit;
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  border: none;
  background: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  -webkit-tap-highlight-color: transparent;
`
const drawerFooterClass = css`
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom);
`

export const Header = ({ initialTheme, currentPath }: { initialTheme: Theme, currentPath: string }) => {

  return (
    <header
      class={headerClass}
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
            <ThemeToggle theme={initialTheme} />
          </li>
          <li>
            <button popovertarget="nav-menu" class={hamburgerButtonClass} aria-label="Open menu">
              <HamburgerIcon />
            </button>
          </li>
        </ul>
      </nav>

      <dialog id="nav-menu" class={hamburgerMenuClass} popover="auto">
        <button
          popovertarget="nav-menu"
          popovertargetaction="hide"
          class={drawerCloseClass}
          aria-label="Close menu"
          autofocus
        >
          <CloseIcon />
        </button>
        <ul>
          <li><a href="/posts" data-current={currentPath.startsWith('/posts') ? 'true' : 'false'}>Posts</a></li>
          <li><a href="/tags" data-current={currentPath.startsWith('/tags') ? 'true' : 'false'}>Tags</a></li>
          <li><a href="/about" data-current={currentPath.startsWith('/about') ? 'true' : 'false'}>About</a></li>
        </ul>
        <div class={drawerFooterClass}>
          <ThemeToggle theme={initialTheme} />
        </div>
      </dialog>
    </header>
  )
}
