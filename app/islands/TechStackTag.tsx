import { css } from "hono/css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  name: string;
  rate: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// CSS dashed-ident に使えない文字をサニタイズ
function toAnchorName(name: string): string {
  return `--tag-${name.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function toTooltipId(name: string): string {
  return `tooltip-${name.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function renderStars(rate: number): string {
  return "★".repeat(rate) + "☆".repeat(3 - rate);
}

function showTooltip(id: string) {
  try {
    document.getElementById(id)?.showPopover();
  } catch {
    // Popover API 非対応ブラウザ
  }
}

function hideTooltip(id: string) {
  try {
    document.getElementById(id)?.hidePopover();
  } catch {
    // Popover API 非対応ブラウザ
  }
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const tagClass = css`
  display: inline-block;
  padding: var(--spacing-2xs) var(--spacing-md);
  border-radius: var(--round-pill);
  font-size: var(--text-body-sm);
  font-weight: var(--font-medium);
  /* 面に置いても輪郭が形を定義する。
     旧実装のダーク(neutral-800 = 0.269)は地(0.29)より暗く、面が沈んでいた */
  background-color: var(--surface);
  color: var(--ink);
  border: 1px solid var(--edge);
  cursor: default;

  &:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
    box-shadow: var(--focus-ring-halo);
  }
`;

const tooltipClass = css`
  position: fixed;
  position-area: block-start center;
  position-try-fallbacks: flip-block;
  margin: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  /* 反転面。ライムは反転面のダーク側(0.95)に対して 1.13 で消えるため使わない */
  border: 1px solid var(--on-inverse);
  border-radius: var(--round-md);
  background-color: var(--inverse);
  color: var(--on-inverse);
  font-size: var(--text-body-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out), display var(--duration-fast) var(--ease-out) allow-discrete;

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export function TechStackTag({ name, rate }: Props) {
  const anchorName = toAnchorName(name);
  const tooltipId = toTooltipId(name);

  return (
    <>
      <span
        class={tagClass}
        tabindex={0}
        aria-describedby={tooltipId}
        style={`anchor-name: ${anchorName}`}
        onMouseEnter={() => showTooltip(tooltipId)}
        onMouseLeave={() => hideTooltip(tooltipId)}
        onFocus={() => showTooltip(tooltipId)}
        onBlur={() => hideTooltip(tooltipId)}
      >
        {name}
      </span>
      <div
        id={tooltipId}
        role="tooltip"
        class={tooltipClass}
        // @ts-expect-error
        popover="hint"
        style={`position-anchor: ${anchorName}`}
      >
        {renderStars(rate)}
      </div>
    </>
  );
}
