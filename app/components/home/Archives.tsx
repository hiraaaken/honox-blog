import { getArchives } from "@/lib/post";
import { css } from "hono/css";

const archiveClass = css`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`

const archiveListClass = css`
  border: var(--card-border);
  border-radius: var(--round-xl);
  box-shadow: var(--card-shadow);
  background-color: var(--color-card-background);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`

const archiveLinkClass = css`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: inherit;

  &:hover {
    color-scheme: light;
    color: var(--color-foreground);
    background-color: var(--color-primary);
  }
`

export const Archives = async () => {
  const archives = await getArchives();

  return (
    <section class={archiveClass}>
      <header>
        <h2>Archives</h2>
      </header>
      <div class={archiveListClass}>
        {archives.map(({ year, month, count }) => (
          <a
            href={`/posts?year=${year}&month=${month}`}
            key={`${year}-${month}`}
            class={archiveLinkClass}
          >
            <span>{year}年{month}月</span>
            <span class="archive-count">({count})</span>
          </a>
        ))}
      </div>
    </section >
  )
}
