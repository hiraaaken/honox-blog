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
  background-color: light-dark(var(--color-neutral-200), var(--color-neutral-800));
  color: light-dark(var(--color-neutral-700), var(--color-neutral-300));
  border: 1px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
  cursor: default;

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

const tooltipClass = css`
  position: fixed;
  position-area: block-start center;
  position-try-fallbacks: flip-block;
  margin: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
  border-radius: var(--round-md);
  background-color: var(--color-neutral-800);
  color: var(--color-primary);
  font-size: var(--text-body-sm);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease-out, display 0.15s ease-out allow-discrete;

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
        popover="hint"
        style={`position-anchor: ${anchorName}`}
      >
        {renderStars(rate)}
      </div>
    </>
  );
}
