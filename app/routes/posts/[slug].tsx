import { createRoute } from "honox/factory";
import { getPostBySlug } from "../../lib/post";
import { css } from 'hono/css'

const postArticle = css`
  width: 800px;
  margin: 0 auto;
`

const postHeader = css`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.875rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .description {
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 0.5rem;
  }
  
  .meta {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .tags {
    margin-top: 0.5rem;
  }
  
  .tag-link {
    margin-right: 0.25rem;
    color: #3b82f6;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .hero-image {
    margin-top: 1rem;
    
    img {
      width: 100%;
      height: auto;
      border-radius: 0.5rem;
    }
  }
`

const postContent = css`
  font-size: 1.125rem;
  line-height: 1.75;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: bold;
  }
  
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  
  p {
    margin-bottom: 1rem;
  }
  
  a {
    color: #3b82f6;
    text-decoration: underline;
  }
  
  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.25rem;
  }
  
  blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #6b7280;
  }
  
  code {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  pre {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  
  pre code {
    background-color: transparent;
    padding: 0;
  }
`

export default createRoute(async (c) => {
  const slug = c.req.param("slug");
  const post = await getPostBySlug(slug);

  if (!post) {
    return c.notFound();
  }

  const { title, description, publishedAt, updatedAt, tags, image, Content } = post;

  return c.render(
    <>
      <article class={postArticle}>
        <header class={postHeader}>
          <h1>{title}</h1>
          <p class="description">{description}</p>
          <div class="meta">
            <time dateTime={publishedAt}>Published at: {new Date(publishedAt).toLocaleDateString("ja-JP")}</time>
            {updatedAt && (
              <>
                {" | "}
                <time dateTime={updatedAt}>Updated at: {new Date(updatedAt).toLocaleDateString("ja-JP")}</time>
              </>
            )}
          </div>
          <div class="tags">
            {tags.map((tag) => (
              <a href={`/tags/${tag}`} class="tag-link" key={tag}>#{tag}</a>
            ))}
          </div>
          {image && (
            <div class="hero-image">
              <img src={image} alt={title} />
            </div>
          )}
        </header>
        <section class={postContent}>
          <Content />
        </section>
      </article>
    </>
  )
})

