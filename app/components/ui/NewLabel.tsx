import { css } from "hono/css";

const newLabelClass = css`
  position: absolute;
  top: -1.4rem;
  right: -1.4rem;
  width: 60px;
  height: 57px;
  filter: drop-shadow(2px 3px 0 rgb(0 0 0 / 0.2));
  z-index: 10;
  pointer-events: none;
  transform: rotate(12deg) scale(0);
  animation: new-label-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
`;

const newLabelShapeClass = css`
  position: absolute;
  inset: 0;
  background: var(--new-label-burst);
  clip-path: polygon(
    50% 0%,   56% 18%,  68% 4%,   66% 22%,
    84% 12%,  76% 28%,  96% 26%,  84% 40%,
    100% 48%, 84% 52%,  96% 66%,  80% 64%,
    88% 82%,  72% 72%,  68% 92%,  56% 78%,
    50% 96%,  44% 78%,  32% 92%,  28% 72%,
    12% 82%,  20% 64%,  4% 66%,   16% 52%,
    0% 48%,   16% 40%,  4% 26%,   24% 28%,
    16% 12%,  34% 22%,  32% 4%,   44% 18%
  );
`;

const newLabelTextClass = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  font-weight: 900;
  font-style: italic;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--new-label-text);
  text-shadow:
    1px 1px 0 var(--new-label-outline),
    -1px -1px 0 var(--new-label-outline),
    1px -1px 0 var(--new-label-outline),
    -1px 1px 0 var(--new-label-outline),
    2px 2px 0 var(--new-label-outline);
`;

export const NewLabel = () => (
  <div class={newLabelClass} aria-label="新着記事">
    <div class={newLabelShapeClass}></div>
    <span class={newLabelTextClass}>NEW!</span>
  </div>
);
