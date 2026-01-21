import { createRoute } from "honox/factory";
import { getAllTags } from "../../lib/post";
import { Tag } from "../../components/Tag";
import { css } from "hono/css";

const tagsSection = css`
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
  max-width: var(--content-max-width);
  display: grid;
  gap: 1rem;
`;

const tagsHeader = css`
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

const tagsContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

export default createRoute(async (c) => {
  const tags = await getAllTags();

  return c.render(
    <section class={tagsSection}>
      <header class={tagsHeader}>
        <h1>Tags</h1>
        <span>
          {tags.length} {tags.length === 1 ? "tag" : "tags"}
        </span>
      </header>
      <div class={tagsContainer}>
        {tags.map(({ tag, count }) => (
          <Tag key={tag} tag={tag} count={count} size="md" />
        ))}
      </div>
    </section>,
  );
});
