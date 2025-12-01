import { createRoute } from "honox/factory";
import { getPostsByTag } from "../../lib/post";
import { PostCard } from "../../components/PostCard";
import { css } from 'hono/css'

const tagPostsSection = css`
  width: 1000px;
  margin: 0 auto;
  padding-top: 5rem;
`

const tagPostsHeader = css`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.875rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  p {
    color: #4b5563;
  }
`

const noPostsText = css`
  color: #6b7280;
`

const tagPostsGrid = css`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export default createRoute(async (c) => {
  const tag = c.req.param("tag");
  const posts = await getPostsByTag(tag);

  return c.render(
    <section class={tagPostsSection}>
      <header class={tagPostsHeader}>
        <h1>Posts tagged with #{tag}</h1>
        <p>{posts.length} posts found</p>
      </header>
      {posts.length === 0 ? (
        <p class={noPostsText}>No posts found with this tag.</p>
      ) : (
        <div class={tagPostsGrid}>
          {posts.map((post) => (
            <PostCard key={post.slug} {...post} />
          ))}
        </div>
      )}
    </section>
  );
});
