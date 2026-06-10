import { css } from "hono/css";

const linkClass = css`
  font-size: inherit;
  position: relative;
  text-decoration: none;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background-color: currentColor;
    transition: width var(--duration-slow);
  }
  
  @media (hover: hover) {
    &:hover {
      opacity: 0.8;
      transition: opacity var(--duration-base) var(--ease-standard);
    }
    
    &:hover::after {
      width: 100%;
    }
  }
`

export const Link = (props: { href: string; children: string }) => {
  return (
    <a href={props.href} class={linkClass}>
      {props.children}
    </a>
  )
}
