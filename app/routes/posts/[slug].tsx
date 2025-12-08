import { createRoute } from "honox/factory";
import { getPostBySlug } from "../../lib/post";
import { Tag } from "../../components/Tag";
import { css } from 'hono/css'

const postArticle = css`
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 7rem var(--size-600) 0;
  box-sizing: border-box;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 5rem var(--size-400) 0;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  @media (max-width: 480px) {
    padding: 4rem var(--size-300) 0;
  }
`

const postHeader = css`
  margin-bottom: var(--size-800);
  
  h1 {
    font-size: clamp(var(--size-600), 4vw, var(--size-1000));
    font-weight: var(--font-bold);
    color: var(--color-foreground);
    margin-bottom: var(--size-200);
    line-height: 1.2;
    
    @media (max-width: 768px) {
      font-size: clamp(var(--size-500), 5vw, var(--size-600));
    }
  }
  
  .description {
    font-size: var(--text-lg);
    color: light-dark(var(--color-neutral-600), var(--color-neutral-400));
    margin-bottom: var(--size-400);
    line-height: 1.6;
  }
  
  .meta {
    font-size: var(--text-sm);
    color: light-dark(var(--color-neutral-500), var(--color-neutral-500));
    margin-bottom: var(--size-300);
  }
  
  .tags {
    margin-top: var(--size-400);
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-200);
  }
  
  .hero-image {
    margin-top: var(--size-600);
    border-radius: var(--round-md);
    overflow: hidden;
    box-shadow: 0 4px 20px light-dark(var(--color-shadow-light), var(--color-shadow-dark));
    
    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }
`

const postContent = css`
  font-size: clamp(var(--text-base), 2.5vw, var(--text-lg));
  line-height: 1.75;
  color: var(--color-foreground);
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: var(--size-800);
    margin-bottom: var(--size-400);
    font-weight: var(--font-bold);
    color: var(--color-foreground);
    line-height: 1.3;
    word-wrap: break-word;
    
    &:first-child {
      margin-top: 0;
    }
    
    @media (max-width: 768px) {
      margin-top: var(--size-600);
      margin-bottom: var(--size-300);
    }
  }
  
  .heading-link {
    color: inherit;
    text-decoration: none;
    border: none;
    transition: color 0.2s ease;
    position: relative;
    
    @media (hover: hover) {
      &:hover {
        color: light-dark(var(--color-lime-600), var(--color-lime-400));
        
        &::before {
          content: '#';
          position: absolute;
          left: -1.2em;
          font-weight: normal;
          color: light-dark(var(--color-neutral-400), var(--color-neutral-500));
          opacity: 0.8;
        }
      }
    }
  }
  
  h1 { 
    font-size: clamp(var(--size-600), 4vw, var(--size-900)); 
    
    @media (max-width: 768px) {
      font-size: clamp(var(--size-500), 5vw, var(--size-600));
    }
  }
  h2 { 
    font-size: clamp(var(--size-500), 3.5vw, var(--size-800));
    padding-bottom: var(--size-150);
    border-bottom: 2px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
    
    @media (max-width: 768px) {
      font-size: clamp(var(--size-400), 4vw, var(--size-500));
    }
  }
  h3 { 
    font-size: clamp(var(--size-450), 3vw, var(--size-700)); 
    
    @media (max-width: 768px) {
      font-size: clamp(var(--size-350), 3.5vw, var(--size-450));
    }
  }
  h4 { 
    font-size: clamp(var(--size-400), 2.5vw, var(--size-600)); 
    
    @media (max-width: 768px) {
      font-size: clamp(var(--size-300), 3vw, var(--size-400));
    }
  }
  
  p {
    margin-bottom: var(--size-600);
    text-align: justify;
    
    @media (max-width: 640px) {
      text-align: left;
    }
  }
  
  a {
    color: light-dark(var(--color-lime-600), var(--color-lime-400));
    text-decoration: none;
    border-bottom: 1px solid currentColor;
    transition: all 0.2s ease;
    
    @media (hover: hover) {
      &:hover {
        color: light-dark(var(--color-lime-700), var(--color-lime-300));
        border-bottom-width: 2px;
      }
    }
  }
  
  ul, ol {
    margin-bottom: var(--size-600);
    padding-left: var(--size-600);
    
    @media (max-width: 640px) {
      padding-left: var(--size-500);
    }
  }
  
  li {
    margin-bottom: var(--size-200);
    line-height: 1.6;
  }
  
  blockquote {
    border-left: 4px solid var(--color-primary);
    padding-left: var(--size-600);
    padding-right: var(--size-400);
    padding-top: var(--size-400);
    padding-bottom: var(--size-400);
    margin: var(--size-800) 0;
    font-style: italic;
    background: light-dark(var(--color-neutral-100), var(--color-neutral-800));
    border-radius: 0 var(--round-md) var(--round-md) 0;
    color: light-dark(var(--color-neutral-600), var(--color-neutral-400));
    
    @media (max-width: 640px) {
      padding-left: var(--size-400);
      margin: var(--size-600) 0;
    }
  }
  
  code {
    background: light-dark(var(--color-neutral-200), var(--color-neutral-800));
    color: light-dark(var(--color-neutral-800), var(--color-neutral-200));
    padding: var(--size-50) var(--size-150);
    border-radius: var(--round-sm);
    font-size: 0.9em;
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    border: 1px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
  }
  
  pre {
    background: var(--color-dark-700) !important;
    padding: var(--size-600);
    border-radius: var(--round-md);
    overflow-x: auto;
    margin: var(--size-800) 0;
    border: 1px solid var(--color-border);
    
    @media (max-width: 640px) {
      padding: var(--size-400);
      margin: var(--size-600) 0;
      border-radius: var(--round-sm);
    }
  }
  
  pre code {
    background: transparent !important;
    padding: 0;
    border: none;
    color: inherit;
    font-family: inherit;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: var(--round-md);
    margin: var(--size-600) 0;
    box-shadow: 0 4px 12px light-dark(var(--color-shadow-light), var(--color-shadow-dark));
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--size-600) 0;
    overflow-x: auto;
    display: block;
    white-space: nowrap;
    max-width: 100%;
    
    @media (max-width: 768px) {
      font-size: var(--text-sm);
      margin: var(--size-400) -var(--size-300);
      width: calc(100% + var(--size-600));
    }
  }
  
  th, td {
    border: 1px solid light-dark(var(--color-neutral-300), var(--color-neutral-700));
    padding: var(--size-300) var(--size-400);
    text-align: left;
  }
  
  th {
    background: light-dark(var(--color-neutral-100), var(--color-neutral-800));
    font-weight: var(--font-semibold);
  }
  
  hr {
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--color-primary), transparent);
    margin: var(--size-800) 0;
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
              <Tag tag={tag} size="sm" key={tag} />
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

