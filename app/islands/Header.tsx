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
    transform var(--duration-slow) var(--ease-standard),
    opacity var(--duration-slow) var(--ease-standard),
    border-bottom-right-radius var(--duration-panel) var(--ease-standard);

  &:has(:popover-open) {
    border-bottom-right-radius: 0;
    transition:
      transform var(--duration-slow) var(--ease-standard),
      opacity var(--duration-slow) var(--ease-standard),
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

  & > span {
    grid-area: 1 / 1;
  }

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

const hamburgerIconClass = css`
  display: flex;
  opacity: 1;
  rotate: 0deg;
  transition: opacity var(--duration-slow) var(--ease-out), rotate var(--duration-slow) var(--ease-out);

  header:has(:popover-open) & {
    opacity: 0;
    rotate: 180deg;
  }
`

const closeIconClass = css`
  display: flex;
  opacity: 0;
  rotate: -180deg;
  transition: opacity var(--duration-slow) var(--ease-out), rotate var(--duration-slow) var(--ease-out);

  header:has(:popover-open) & {
    opacity: 1;
    rotate: 0deg;
  }
`

const hamburgerMenuClass = css`
  width: 600px;
  height: 600px;
  transition:
    opacity var(--duration-spring) var(--ease-spring),
    translate var(--duration-spring) var(--ease-spring),
    display var(--duration-spring) allow-discrete,
    overlay var(--duration-spring) allow-discrete;
  border: var(--header-border);
  background-color: var(--color-hamburger-background);
  color: var(--color-hamburger-foreground);
  border-radius: var(--round-full);


  &:popover-open {
    translateX: 50px;
    translateY: 50px;

    @starting-style {
      translate: 100px;
      toranslateY: 100px;
    }
  }
`

// const hamburgerMenuClass = css`
//   /* Reset dialog UA styles */
//   margin: 0;
//   padding: 0;
//   border: none;
//   color: inherit;
//
//   /* Anchor positioning */
//   inset: unset;
//   position-anchor: --header;
//   top: anchor(--header bottom);
//   left: calc(100% - 140px);
//   margin-top: calc(-1 * var(--border-width-thick));
//   width: 140px;
//
//   @media (max-width: 1100px) {
//     left: calc(100% - 140px - var(--spacing-lg));
//   }
//
//   @media (max-width: 768px) {
//     left: calc(100% - 140px - var(--spacing-sm));
//   }
//
//   /* Styling */
//   background-color: var(--color-header-background);
//   border: var(--header-border);
//   border-top: none;
//   border-radius: 0 0 var(--round-md) var(--round-md);
//
//   /* Entry/exit animation */
//   clip-path: inset(0 0 100% 0);
//   transition-property: clip-path, display, overlay;
//   transition-duration: var(--duration-panel);
//   transition-timing-function: var(--ease-standard);
//   transition-behavior: normal, allow-discrete, allow-discrete;
//
//   &:popover-open {
//     clip-path: inset(0 0 0 0);
//
//     @starting-style {
//       clip-path: inset(0 0 100% 0);
//     }
//   }
//
//   ul {
//     list-style: none;
//     display: flex;
//     flex-direction: column;
//     gap: var(--spacing-md);
//     padding: var(--spacing-md);
//     font-size: clamp(var(--text-md), 2.5vw, var(--text-lg));
//     font-weight: var(--font-semibold);
//     margin: 0;
//
//     a {
//       position: relative;
//
//       &::after {
//         content: '';
//         position: absolute;
//         left: 0;
//         bottom: 0;
//         width: 0;
//         height: 3px;
//         background-color: var(--color-primary);
//         transition: width var(--duration-slow);
//       }
//
//       &:hover {
//         opacity: 0.8;
//         transition: opacity var(--duration-base) var(--ease-standard);
//       }
//
//       &:hover::after {
//         width: 100%;
//       }
//     }
//   }
// `
//
export const Header = ({ initialTheme, currentPath }: { initialTheme: Theme, currentPath: string }) => {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 300) {
        setVisible(true);
      } else {
        setVisible(currentY < lastScrollY);
      }

      if (currentY >= 300 && currentY > lastScrollY) {
        const menu = document.getElementById('nav-menu') as HTMLElement | null;
        if (menu?.matches(':popover-open')) {
          menu.hidePopover();
        }
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
            <button popovertarget="nav-menu" class={hamburgerButtonClass} aria-label="Open menu">
              <span class={hamburgerIconClass}><HamburgerIcon /></span>
              <span class={closeIconClass}><CloseIcon /></span>
            </button>
          </li>
        </ul>
      </nav>

      <dialog id="nav-menu" class={hamburgerMenuClass} popover="auto">
        <ul>
          <li><a href="/posts" data-current={currentPath.startsWith('/posts') ? 'true' : 'false'}>Posts</a></li>
          <li><a href="/tags" data-current={currentPath.startsWith('/tags') ? 'true' : 'false'}>Tags</a></li>
          <li><a href="/about" data-current={currentPath.startsWith('/about') ? 'true' : 'false'}>About</a></li>
        </ul>
      </dialog>
    </header>
  )
}
