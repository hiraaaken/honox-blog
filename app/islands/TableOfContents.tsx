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
  padding: var(--size-600);
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
  margin-bottom: var(--size-400);
  padding-bottom: var(--size-200);
  border-bottom: 2px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
`;

const tocList = css`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const tocItem = css`
  margin-bottom: var(--size-200);

  &[data-level="3"] {
    padding-left: var(--size-400);
  }

  a {
    display: block;
    padding: var(--size-150) var(--size-200);
    color: light-dark(var(--color-neutral-600), var(--color-neutral-400));
    text-decoration: none;
    font-size: var(--text-sm);
    line-height: 1.5;
    border-radius: var(--round-sm);
    transition: all 0.2s ease;

    @media (hover: hover) {
      &:hover {
        color: var(--color-primary);
        background: light-dark(var(--color-neutral-100), var(--color-neutral-800));
      }
    }
  }
`;

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Extract h2 and h3 headings from the article
    const articleElement = document.querySelector("article");
    if (!articleElement) return;

    const headingElements = articleElement.querySelectorAll("h2, h3");
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

  // Don't render if no headings found
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav class={tocContainer} aria-label="Table of Contents">
      <h2 class={tocTitle}>目次</h2>
      <ul class={tocList}>
        {headings.map((heading) => (
          <li key={heading.id} class={tocItem} data-level={heading.level}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
