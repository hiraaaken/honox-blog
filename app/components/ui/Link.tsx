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
    transition: width 0.3s ease;
  }
  
  @media (hover: hover) {
    &:hover {
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;
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
