import { createRoute } from "honox/factory";
import { getPostsByTag } from "../../lib/post";
import { PostCard } from "../../components/PostCard";
import { css } from "hono/css";

const postsSection = css`
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
  max-width: var(--content-max-width);
  display: grid;
  gap: var(--size-300);
`;

const postsHeader = css`
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

const noPostsCard = css`
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  box-shadow: 1.5px 3px 0 var(--color-shadow);
  padding: 3rem;
  background-color: var(--color-card-background);
  color: var(--color-card-foreground);
  text-align: center;
  font-size: var(--text-body-lg);
  opacity: 0.7;
`;

const postsGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export default createRoute(async (c) => {
  const tag = c.req.param("tag");
  const posts = await getPostsByTag(tag);

  return c.render(
    <>
      <section class={postsSection}>
        <header class={postsHeader}>
          <h1>#{tag}</h1>
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </header>

        {posts.length === 0 ? (
          <div class={noPostsCard}>
            <p>No posts found with this tag.</p>
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