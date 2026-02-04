import { css } from "hono/css";
import { Link } from "./ui/Link";
import { Tag } from "./Tag";

const popularTagsSectionClass = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`
const tagsClass = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-base);
`

const footerClass = css`
  text-align: right;
  font-size: var(--text-2xl);
`

interface TagData {
  tag: string;
  count: number;
}

interface PopularTagsProps {
  tags: TagData[];
}

export const PopularTags = ({ tags }: PopularTagsProps) => {
  return (
    <section class={popularTagsSectionClass}>
      <header>
        <h2>Popular Tags</h2>
      </header>
      <div class={tagsClass}>
        {tags.map(({ tag, count }) => (
          <Tag tag={tag} size="md" count={count} />
        ))}
      </div>
      <footer class={footerClass}>
        <Link href="/tags">see more...</Link>
      </footer>
    </section>
  )
}
