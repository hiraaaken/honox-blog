import { createRoute } from "honox/factory";
import { getPosts, getPostsByYearMonth } from "../../lib/post";
import { PostCard } from "../../components/PostCard";
import { css } from 'hono/css'

const postsSection = css`
  max-width: 1000px;
  margin: 0 auto;
  padding: 5rem 1rem 2rem;
`

const postsHeader = css`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 4rem;
    font-weight: bold;
    letter-spacing: -0.025em;
    margin-bottom: 1rem;
    background: var(--color-primary);
    color: #2D2D2D;
    display: inline-block;
    padding: 0 1rem;
    border-radius: 1rem;
    box-shadow: 1.5px 3px 0 var(--color-card-shadow);
  }
  
  p {
    font-size: 1.25rem;
    color: var(--color-foreground);
    opacity: 0.8;
  }
`

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
`

const postsGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

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
`

export default createRoute(async (c) => {
  const year = c.req.query("year");
  const month = c.req.query("month");

  let posts;
  let pageTitle = "All Posts";
  let showBackLink = false;

  if (year && month) {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    posts = await getPostsByYearMonth(yearNum, monthNum);
    pageTitle = `${yearNum}年${monthNum}月の記事`;
    showBackLink = true;
  } else {
    posts = await getPosts();
  }

  return c.render(
    <>
      <section class={postsSection}>
        {showBackLink && (
          <a href="/posts" class={backLink}>← All Posts</a>
        )}

        <header class={postsHeader}>
          <h1>{pageTitle}</h1>
          <p>{posts.length} {posts.length === 1 ? 'post' : 'posts'} found</p>
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
    </>)
})
