import { createRoute } from "honox/factory";
import { getPostBySlug, getAdjacentPosts } from "../../lib/post";
import { Tag } from "../../components/Tag";
import { TableOfContents } from "../../islands/TableOfContents";
import { css } from "hono/css";

const postLayout = css`
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 6rem var(--spacing-lg) 2rem;
  box-sizing: border-box;
  width: 100%;

  @media (max-width: 768px) {
    padding: 6rem var(--spacing-md-lg) 2rem;
    max-width: 100vw;
    overflow-x: hidden;
  }
`;

const contentArea = css`
  &:has(nav[aria-label="Table of Contents"]) {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: var(--spacing-sm);

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
`;

const postArticle = css`
  min-width: 0;
  box-sizing: border-box;
`;

const postHeader = css`
  margin-bottom: var(--spacing-xl);

  >.title {
    font-size: var(--text-responsive-title);
    font-weight: var(--font-bold);
    color: var(--color-foreground);
    margin-bottom: var(--spacing-sm);
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: var(--text-responsive-title-mobile);
    }
  }

  >.description {
    font-size: var(--text-base);
    color: var(--color-muted);
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }

  .meta {
    font-size: var(--text-sm);
    color: var(--color-muted-light);
    margin-bottom: var(--spacing-base);
  }

  .tags {
    margin-top: var(--spacing-md);
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .hero-image {
    margin: 0 auto var(--spacing-lg) auto;
    border-radius: var(--round-md);
    overflow: hidden;
    box-shadow: 0 4px 20px light-dark(var(--color-shadow-light), var(--color-shadow-dark));
    max-width: 600px;
    
    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }
`;

const postContent = css`
  color: var(--color-foreground);
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: var(--spacing-xl);
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-bold);
    color: var(--color-foreground);
    line-height: 1.3;
    word-wrap: break-word;
    scroll-margin-top: 6rem;

    &:first-child {
      margin-top: 0;
    }

    @media (max-width: 768px) {
      margin-top: var(--spacing-lg);
      margin-bottom: var(--spacing-base);
      scroll-margin-top: 5rem;
    }
  }
  
  :is(h1, h2, h3, h4, h5, h6) .heading-link {
    color: inherit;
    text-decoration: none;
    border: none;
    border-bottom: none;
    transition: color 0.2s ease;
    position: relative;

  @media (hover: hover) {
    &:hover {
      text-decoration: underline;
      
      &::before,
      &::after {
        position: absolute;
        font-weight: normal;
        color: inherit;
      }
      
      /* 768px以上の場合：左に表示 */
      @container style(--inline-size-md: var(--window-md)) {
        &::before {
          content: '#';
          left: -0.8em;
        }
        &::after {
          content: none;
        }
      }
      
      /* 768px未満の場合：右に表示 */
      @container style(--inline-size-md: 100vi) {
        &::before {
          content: none;
        }
        &::after {
          content: '#';
          right: -0.8em;
        }
      }
    }
  }
  }
  
  h1 {
    font-size: var(--text-responsive-h1);

    @media (max-width: 768px) {
      font-size: var(--text-responsive-h1-mobile);
    }
  }
  h2 {
    font-size: var(--text-responsive-h2);
    padding-bottom: var(--heading-h2-padding-bottom);
    border-bottom: var(--heading-border-width) solid var(--color-heading-border);

    @media (max-width: 768px) {
      font-size: var(--text-responsive-h2-mobile);
    }
  }
  h3 {
    font-size: var(--text-responsive-h3);

    @media (max-width: 768px) {
      font-size: var(--text-responsive-h3-mobile);
    }
  }
  h4 {
    font-size: var(--text-responsive-h4);

    @media (max-width: 768px) {
      font-size: var(--text-responsive-h4-mobile);
    }
  }
  
  p {
    margin-bottom: var(--spacing-lg);
    text-align: justify;

    @media (max-width: 480px) {
      text-align: left;
    }
  }
  
  a {
    color: light-dark(var(--color-secondary), var(--color-secondary-lighten));
    text-decoration: underline;
    transition: all 0.2s ease;
    
    @media (hover: hover) {
      &:hover {
        text-decoration: none;
      }
    }
  }
  
  ul, ol {
    margin-bottom: var(--spacing-lg);
    padding-left: var(--spacing-lg);

    @media (max-width: 480px) {
      padding-left: var(--spacing-md-lg);
    }
  }
  
  li {
    line-height: 1.6;
  }
  
  blockquote {
    border-left: 4px solid var(--color-primary);
    padding: var(--blockquote-padding-y) var(--blockquote-padding-y) var(--blockquote-padding-y) var(--blockquote-padding-x);
    margin: var(--spacing-xl) 0;
    font-style: italic;
    background: var(--color-blockquote-bg);
    border-radius: 0 var(--round-md) var(--round-md) 0;
    color: var(--color-blockquote-fg);

    @media (max-width: 480px) {
      padding-left: var(--blockquote-padding-x-mobile);
      margin: var(--spacing-lg) 0;
    }
  }
  
  code {
    background: var(--color-code-inline-bg);
    color: var(--color-code-inline-fg);
    padding: var(--code-inline-padding);
    border-radius: var(--round-sm);
    font-size: 1em;
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
    border: 1px solid var(--color-code-inline-border);
  }
  
  pre {
    background: var(--color-code-block-bg);
    padding: var(--code-block-padding);
    border-radius: var(--round-md);
    overflow-x: auto;
    margin: var(--spacing-xl) 0;
    border: 1px solid var(--color-border);
    line-height: 1.6;
    font-size: 1em;
    max-width: 100%;
    box-sizing: border-box;

    @media (max-width: 480px) {
      padding: var(--code-block-padding-mobile);
      margin: var(--spacing-lg) 0;
      border-radius: var(--round-sm);
      font-size: 0.9em;
    }
  }
  
  pre code {
    background: transparent !important;
    padding: 0;
    border: none;
    color: inherit;
    font-family: inherit;
    font-size: 1.2em;
    line-height: inherit;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: var(--round-md);
    margin: var(--spacing-lg) 0;
    box-shadow: 0 4px 12px light-dark(var(--color-shadow-light), var(--color-shadow-dark));
  }

  .table-wrapper {
    overflow-x: auto;
    margin: var(--spacing-lg) 0;
    border-radius: var(--round-md);
    border: 1px solid var(--color-table-border);

    @media (max-width: 768px) {
      margin: var(--spacing-md) 0;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
    min-width: max-content;
    
    @media (max-width: 768px) {
      font-size: var(--text-sm);
    }
  }
  
  th, td {
    border: 1px solid var(--color-table-border);
    padding: var(--table-cell-padding);
    text-align: left;
  }

  th {
    background: var(--color-table-header-bg);
    font-weight: var(--font-semibold);
  }

  hr {
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--color-primary), transparent);
    margin: var(--spacing-xl) 0;
  }
`;

const postNavigation = css`
  margin-top: var(--spacing-2xl);
  display: flex;
  justify-content: space-between;
  gap: var(--post-nav-gap);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--post-nav-gap-mobile);
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    padding: var(--post-nav-link-padding);
    background-color: var(--color-card-background);
    border: var(--card-border);
    border-radius: 1rem;
    box-shadow: var(--card-shadow);
    transform: translateY(0) scale(1);
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    flex: 1;
    color: inherit;
    
    &.prev {
      text-align: left;
    }
    
    &.next {
      text-align: right;
    }
    
    @media (hover: hover) {
      &:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: var(--card-shadow-hover);
      }
    }
    
    .nav-direction {
      font-size: var(--text-sm);
      color: var(--color-muted);
      margin-bottom: var(--spacing-sm);
      font-weight: var(--font-medium);
    }
    
    .nav-title {
      font-size: var(--text-base);
      color: var(--color-foreground);
      font-weight: var(--font-semibold);
      line-height: 1.4;
      
      @media (max-width: 480px) {
        font-size: var(--text-sm);
      }
    }
  }
  
  .nav-placeholder {
    flex: 1;
  }
`;

export default createRoute(async (c) => {
  const slug = c.req.param("slug");
  const post = await getPostBySlug(slug);

  if (!post) {
    return c.notFound();
  }

  const { title, description, publishedAt, updatedAt, tags, image, Content } =
    post;

  const { prev, next } = await getAdjacentPosts(slug);

  return c.render(
    <div class={postLayout}>
      <div class={contentArea}>
        <article class={postArticle}>
          <header class={postHeader}>
            {image && (
              <div class="hero-image">
                <img src={image} alt={title} />
              </div>
            )}
            <h1 class="title">{title}</h1>
            <p class="description">{description}</p>
            <div class="meta">
              <time dateTime={publishedAt}>
                Published at: {new Date(publishedAt).toLocaleDateString("ja-JP")}
              </time>
              {updatedAt && (
                <>
                  {" | "}
                  <time dateTime={updatedAt}>
                    Updated at: {new Date(updatedAt).toLocaleDateString("ja-JP")}
                  </time>
                </>
              )}
            </div>
            <div class="tags">
              {tags.map((tag) => (
                <Tag tag={tag} size="sm" key={tag} />
              ))}
            </div>
          </header>
          <section class={postContent}>
            <Content />
          </section>
        </article>
        <TableOfContents />
      </div>
      <nav class={postNavigation}>
        {prev ? (
          <a href={`/posts/${prev.slug}`} class="nav-link prev">
            <div class="nav-direction">← 前の記事</div>
            <div class="nav-title">{prev.title}</div>
          </a>
        ) : (
          <div class="nav-placeholder"></div>
        )}
        {next ? (
          <a href={`/posts/${next.slug}`} class="nav-link next">
            <div class="nav-direction">次の記事 →</div>
            <div class="nav-title">{next.title}</div>
          </a>
        ) : (
          <div class="nav-placeholder"></div>
        )}
      </nav>
    </div>,
  );
});
