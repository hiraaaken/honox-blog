import { createRoute } from "honox/factory";
import { getPostsByYearMonth } from "../../lib/post";
import { PostCard } from "../../components/PostCard";
import { css } from "hono/css";

const archiveSection = css`
  max-width: 1000px;
  margin: 0 auto;
  padding: 8rem 1rem 2rem;
`;

const archiveHeader = css`
  margin-bottom: 3rem;
  
  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--color-foreground);
  }
  
  p {
    font-size: 1.125rem;
    color: var(--color-foreground);
    opacity: 0.8;
  }
`;

const noPostsCard = css`
  border: 2px solid var(--color-border);
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
  gap: 1.5rem;
  
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
  const posts = await getPostsByYearMonth(yearNum, monthNum);
  const pageTitle = `${yearNum}年${monthNum}月の記事`;

  return c.render(
    <>
      <section class={archiveSection}>
        <a href="/posts" class={backLink}>
          ← All Posts
        </a>

        <header class={archiveHeader}>
          <h1>{pageTitle}</h1>
          <p>
            {posts.length} {posts.length === 1 ? "post" : "posts"} found
          </p>
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