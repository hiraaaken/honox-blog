import { createRoute } from "honox/factory";
import { getPostsByYearMonth } from "../../lib/post";
import { PostCard } from "../../components/PostCard";
import { css } from "hono/css";

const archiveSection = css`
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
  max-width: var(--content-max-width);
  display: grid;
  gap: var(--spacing-base);
`;

const archiveHeader = css`
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

const noPostsCard = css`
  border: var(--card-border);
  border-radius: 1rem;
  box-shadow: 1.5px 3px 0 var(--color-card-shadow);
  padding: 3rem;
  background-color: var(--color-card-background);
  color: var(--color-card-foreground);
  text-align: center;
  font-size: 1.125rem;
  opacity: 0.7;
`;

const postsGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const backLink = css`
  display: inline-block;
  margin-bottom: 2rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: #2D2D2D;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  border: 2px solid var(--color-border);
  box-shadow: 1px 2px 0 var(--color-card-shadow);
  transition: all 0.3s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 2px 4px 0 var(--color-card-shadow);
  }
`;

export default createRoute(async (c) => {
  const year = c.req.query("year");
  const month = c.req.query("month");

  if (!year || !month) {
    return c.redirect("/posts");
  }

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  const yearMonth = `${year}-${month.padStart(2, "0")}`;
  const posts = await getPostsByYearMonth(yearMonth);
  const pageTitle = `${yearNum}年${monthNum}月の記事`;

  return c.render(
    <>
      <section class={archiveSection}>
        <a href="/posts" class={backLink}>
          ← All Posts
        </a>

        <header class={archiveHeader}>
          <h1>{pageTitle}</h1>
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </header>

        {posts.length === 0 ? (
          <div class={noPostsCard}>
            <p>No posts found for this period.</p>
          </div>
        ) : (
          <div class={postsGrid}>
            {posts.map((post) => (
              <PostCard key={post.slug} {...post} />
            ))}
          </div>
        )}
      </section>
    </>,
  );
});