import { css } from "hono/css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  id: string;
  label: string;
  children: any;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toggleTooltip(id: string) {
  try {
    const el = document.getElementById(id);
    if (!el) return;
    el.togglePopover();
  } catch {
    // Popover API 非対応ブラウザ
  }
}

function showTooltip(id: string) {
  try {
    const el = document.getElementById(id);
    if (!el || el.matches(":popover-open")) return;
    el.showPopover();
  } catch {}
}

function hideTooltip(id: string) {
  try {
    document.getElementById(id)?.hidePopover();
  } catch {}
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const triggerClass = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  border-radius: var(--round-full);
  border: 1px solid var(--color-muted);
  color: var(--color-muted);
  font-size: 0.75em;
  font-weight: var(--font-bold);
  line-height: 1;
  cursor: pointer;
  vertical-align: middle;
  transition: opacity 0.15s;

  @media (hover: hover) {
    &:hover {
      opacity: 0.6;
    }
  }

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
  margin-top: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
  border-radius: var(--round-md);
  background-color: var(--color-neutral-800);
  color: var(--color-neutral-200);
  font-size: var(--text-body-sm);
  font-weight: normal;
  line-height: 1.6;
  width: max-content;
  max-width: 400px;
  opacity: 0;
  transition: opacity 0.15s ease-out, display 0.15s ease-out allow-discrete;
  container-type: anchored;

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export function InfoTooltip({ id, label, children }: Props) {
  const tooltipId = `info-tooltip-${id}`;
  const anchorName = `--info-${id}`;

  return (
    <>
      <button
        type="button"
        class={triggerClass}
        style={`anchor-name: ${anchorName}`}
        aria-label={label}
        aria-describedby={tooltipId}
        onClick={() => toggleTooltip(tooltipId)}
        onMouseEnter={() => showTooltip(tooltipId)}
        onMouseLeave={() => hideTooltip(tooltipId)}
        onFocus={() => showTooltip(tooltipId)}
        onBlur={() => hideTooltip(tooltipId)}
      >
        ?
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        class={tooltipClass}
        popover="auto"
        style={`position-anchor: ${anchorName}`}
      >
        {children}
      </div>
    </>
  );
}
