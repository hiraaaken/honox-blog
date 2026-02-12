import { css } from "hono/css";
import type { Heading } from "../types/post";

interface TableOfContentsProps {
  headings: Heading[];
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

  @media (max-width: 768px) {
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
    transition: all 0.2s ease;

    @media (hover: hover) {
      &:hover {
        color: var(--toc-selected-item-color);
        text-shadow: var(--toc-selected-item-outline);
        font-weight: var(--font-semibold);
      }
    }
  }

  a:target-before {
    color: var(--toc-target-before-color);

    &:hover {
      color: var(--toc-selected-item-color);
    }
  }

  a:target-current {
    color: var(--toc-selected-item-color);
    text-shadow: var(--toc-selected-item-outline);
    font-weight: var(--font-semibold);
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
    transition: all 0.2s ease;

    @media (hover: hover) {
      &:hover {
        color: var(--color-primary);
        background: var(--color-hover-background);
      }
    }
  }

  a:target-before {
    color: var(--toc-target-before-color);

    &:hover {
      color: var(--toc-selected-item-color);
    }
  }

  a:target-current {
    color: var(--toc-selected-item-color);
    text-shadow: var(--toc-selected-item-outline);
    font-weight: var(--font-semibold);
  }
`;


export function TableOfContents({ headings }: TableOfContentsProps) {
  // 見出しがない場合は何も表示しない
  if (headings.length === 0) {
    return null;
  }

  // h3 を親の h2 の下にグループ化
  const groupedHeadings: { h2: Heading; h3s: Heading[] }[] = [];
  let currentGroup: { h2: Heading; h3s: Heading[] } | null = null;

  for (const heading of headings) {
    if (heading.level === 2) {
      if (currentGroup) {
        groupedHeadings.push(currentGroup);
      }
      currentGroup = { h2: heading, h3s: [] };
    } else if (heading.level === 3 && currentGroup) {
      currentGroup.h3s.push(heading);
    }
  }

  if (currentGroup) {
    groupedHeadings.push(currentGroup);
  }

  return (
    <nav class={tocContainer} aria-label="Table of Contents">
      <h2 class={tocTitle}>目次</h2>
      <ul class={tocList}>
        {groupedHeadings.map((group) => (
          <li key={group.h2.id} class={tocItemH2}>
            <a href={`#${group.h2.id}`}>{group.h2.text}</a>
            {group.h3s.length > 0 && (
              <ul class={tocNestedList}>
                {group.h3s.map((h3) => (
                  <li key={h3.id} class={tocItemH3}>
                    <a href={`#${h3.id}`}>{h3.text}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
