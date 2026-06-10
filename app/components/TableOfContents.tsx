import { css } from "hono/css";
import type { groupedHeading } from "../types/post";

interface TableOfContentsProps {
  headings: groupedHeading[];
}

const tocContainer = css`
  position: sticky;
  top: 6rem;
  max-height: calc(100vh - 10rem);
  overflow-y: auto;
  padding: var(--toc-padding);
  background: var(--color-card-background);
  border: var(--card-border);
  border-radius: var(--round-md);
  box-shadow: var(--card-shadow);
  height: fit-content;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const tocTitle = css`
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-foreground);
  margin-bottom: var(--toc-title-margin-bottom);
  padding-bottom: var(--toc-title-padding-bottom);
  border-bottom: 2px solid var(--color-toc-border);
`;

const tocList = css`
  list-style: none;
  padding: 0;
  margin: 0;
  scroll-target-group: auto;
`;

const tocItemH2 = css`
  margin-bottom: var(--spacing-xs);

  a {
    display: block;
    padding: var(--toc-item-padding);
    color: var(--color-foreground);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    line-height: 1.5;
    border-radius: var(--round-sm);
    transition: color var(--duration-base), background-color var(--duration-base);

    @media (hover: hover) {
      &:hover {
        color: var(--toc-selected-item-color);
        background-color: var(--color-primary);
      }
    }
  }

  a:target-before {
    color: var(--toc-target-before-color);

    &:hover {
      color: var(--toc-selected-item-color);
      background-color: var(--color-primary);
    }
  }

  a:target-current {
    color: var(--toc-selected-item-color);
    background-color: var(--color-primary);
  }
`;

const tocNestedList = css`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-left: var(--toc-nested-margin-left);
  border-left: 1px solid var(--color-toc-border);
`;

const tocItemH3 = css`
  margin-bottom: var(--spacing-2xs);

  a {
    display: block;
    padding: var(--toc-nested-item-padding);
    color: var(--color-muted);
    text-decoration: none;
    font-size: var(--text-xs);
    line-height: 1.5;
    border-radius: var(--round-sm);
    transition: color var(--duration-base), background-color var(--duration-base);

    @media (hover: hover) {
      &:hover {
        color: var(--toc-selected-item-color);
        background-color: var(--color-primary);
      }
    }
  }

  a:target-before {
    color: var(--toc-target-before-color);

    &:hover {
      color: var(--toc-selected-item-color);
      background-color: var(--color-primary);
    }
  }

  a:target-current {
    color: var(--toc-selected-item-color);
    background-color: var(--color-primary);
  }
`;


const mobileTocContainer = css`
  display: none;
  margin-bottom: var(--spacing-md);
  border: var(--mobile-toc-border);
  border-radius: var(--mobile-toc-radius);
  background: var(--mobile-toc-bg);
  overflow: hidden;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const mobileTocSummary = css`
  padding: var(--mobile-toc-summary-padding);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-foreground);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  &::-webkit-details-marker {
    display: none;
  }

  &::before {
    content: "▶";
    font-size: var(--text-xs);
    transition: transform var(--duration-spring) var(--ease-spring);
  }

  details[open] &::before {
    transform: rotate(90deg);
  }
`;

const mobileTocContent = css`
  interpolate-size: allow-keywords;
  overflow: clip;
  height: 0;
  transition: height var(--duration-spring) var(--ease-spring);
  padding: 0 var(--mobile-toc-padding);

  details[open] & {
    height: auto;
    padding-bottom: var(--mobile-toc-padding);
  }
`;

function TocList({
  grouped,
  itemH2Class,
  nestedListClass,
  itemH3Class,
  listClass,
}: {
  grouped: groupedHeading[];
  itemH2Class: Promise<string>;
  nestedListClass: Promise<string>;
  itemH3Class: Promise<string>;
  listClass: Promise<string>;
}) {
  return (
    <ul class={listClass}>
      {grouped.map((group) => (
        <li key={group.parent.id} class={itemH2Class}>
          <a href={`#${group.parent.id}`}>{group.parent.text}</a>
          {group.children.length > 0 && (
            <ul class={nestedListClass}>
              {group.children.map((h3) => (
                <li key={h3.id} class={itemH3Class}>
                  <a href={`#${h3.id}`}>{h3.text}</a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MobileTOC({ headings }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <details class={mobileTocContainer}>
      <summary class={mobileTocSummary}>目次</summary>
      <div class={mobileTocContent}>
        <TocList
          grouped={headings}
          listClass={tocList}
          itemH2Class={tocItemH2}
          nestedListClass={tocNestedList}
          itemH3Class={tocItemH3}
        />
      </div>
    </details>
  );
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav class={tocContainer} aria-label="Table of Contents">
      <h2 class={tocTitle}>目次</h2>
      <TocList
        grouped={headings}
        listClass={tocList}
        itemH2Class={tocItemH2}
        nestedListClass={tocNestedList}
        itemH3Class={tocItemH3}
      />
    </nav>
  );
}
