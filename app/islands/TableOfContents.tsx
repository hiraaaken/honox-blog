import { useState, useEffect } from "hono/jsx";
import { css } from "hono/css";

interface Heading {
  id: string;
  text: string;
  level: number;
}

const tocContainer = css`
  position: sticky;
  top: 8rem;
  max-height: calc(100vh - 10rem);
  overflow-y: auto;
  padding: var(--toc-padding);
  background: var(--color-card-background);
  border: var(--card-border);
  border-radius: var(--round-md);
  box-shadow: var(--card-shadow);

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
        color: var(--color-primary);
        background: var(--color-hover-background);
      }
    }
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
`;

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Wait for DOM to be fully ready
    const extractHeadings = () => {
      const articleElement = document.querySelector("article");
      if (!articleElement) {
        setIsLoaded(true);
        return;
      }

      // Look for h2 and h3 headings within the article content section
      const headingElements = articleElement.querySelectorAll("h2[id], h3[id]");
      const extractedHeadings: Heading[] = [];

      headingElements.forEach((heading) => {
        const id = heading.id;
        const text = heading.textContent?.trim() || "";
        const level = parseInt(heading.tagName.substring(1));

        if (id && text) {
          extractedHeadings.push({ id, text, level });
        }
      });

      setHeadings(extractedHeadings);
      setIsLoaded(true);
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      extractHeadings();
    });
  }, []);

  const handleClick = (e: Event, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without triggering scroll
      history.pushState(null, "", `#${id}`);
    }
  };

  // Always render the container for proper hydration
  // Hide with CSS if no headings after client-side load
  if (isLoaded && headings.length === 0) {
    return null;
  }

  // Group h3 headings under their parent h2
  const groupedHeadings: { h2: Heading; h3s: Heading[] }[] = [];
  let currentGroup: { h2: Heading; h3s: Heading[] } | null = null;

  headings.forEach((heading) => {
    if (heading.level === 2) {
      if (currentGroup) {
        groupedHeadings.push(currentGroup);
      }
      currentGroup = { h2: heading, h3s: [] };
    } else if (heading.level === 3 && currentGroup) {
      currentGroup.h3s.push(heading);
    }
  });

  if (currentGroup) {
    groupedHeadings.push(currentGroup);
  }

  return (
    <nav class={tocContainer} aria-label="Table of Contents">
      <h2 class={tocTitle}>目次</h2>
      <ul class={tocList}>
        {groupedHeadings.map((group) => (
          <li key={group.h2.id} class={tocItemH2}>
            <a
              href={`#${group.h2.id}`}
              onClick={(e) => handleClick(e, group.h2.id)}
            >
              {group.h2.text}
            </a>
            {group.h3s.length > 0 && (
              <ul class={tocNestedList}>
                {group.h3s.map((h3) => (
                  <li key={h3.id} class={tocItemH3}>
                    <a
                      href={`#${h3.id}`}
                      onClick={(e) => handleClick(e, h3.id)}
                    >
                      {h3.text}
                    </a>
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
