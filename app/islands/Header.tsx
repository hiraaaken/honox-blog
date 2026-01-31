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
  box-shadow: var(--header-shadow);
  position: fixed;
  top: var(--size-300);
  left: 0;
  right: 0;
  margin-inline: auto;
  border-radius: var(--round-lg);
  border: var(--header-border);
  padding: var(--size-300) var(--size-800);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: 
    transform 0.3s ease-in-out,
    opacity 0.3s ease-in-out;

  @media (max-width: 1100px) {
    margin-inline: var(--size-400);
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
  gap: var(--size-700);
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
  display: flex;
  align-items: center;
  height: 100%;
  
  @media (hover: hover) {
    &:hover {
      transition: transform 0.2s ease-in-out, fill 0.2s ease-in-out;
      transform: scale(1.1);

      & > svg > path {
        fill: var(--color-primary);
      }
    }
  }
`

const hamburgerMenuClass = css`
  border: var(--border-width-thick) solid var(--color-neutral-950);
  border-radius: var(--round-md);
  width: 200px;
  height: 190px;
  margin: 0 auto;
  transition:
    translate .2s ease-out,
    display .2s ease-out allow-discrete,
    overlay .2s ease-out allow-discrete;
  translate: 250px 0;
  box-shadow: var(--shadow-md);
  top: 0;
  left: auto;
  background-color: var(--color-header-background);
  color: currentColor;

  &:popover-open {
    translate: 0 0;
    
    @starting-style {
      translate: 250px 0;
    }
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--size-400);
    padding: var(--size-400);
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

const closeButtonClass = css`
  position: absolute;
  top: var(--size-400);
  right: var(--size-400);
  background: none;
  border: none;
  filter: grayscale(100);
  cursor: pointer;
  
  &:hover {
    opacity: 0.7;
    transition: opacity 0.2s ease-in-out;
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
            <button popovertarget="menu" class={hamburgerButtonClass} aria-label="Open menu">
              <HamburgerIcon />
            </button>
          </li>
        </ul>
      </nav>

      <aside popover id="menu" class={hamburgerMenuClass}>
        <button popovertarget="menu" popovertargetaction="hide" class={closeButtonClass}>
          <CloseIcon />
        </button>
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
