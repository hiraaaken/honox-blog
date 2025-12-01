import { createRoute } from "honox/factory";
import { getAllTags } from "../../lib/post";
import { css } from 'hono/css'

const tagsSection = css`
  max-width: 1000px;
  margin: 0 auto;
  padding: 5rem 1rem 2rem;
`

const tagsHeader = css`
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

const tagsGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const tagCard = css`
  display: block;
  padding: 1.5rem;
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  box-shadow: 1.5px 3px 0 var(--color-card-shadow);
  text-decoration: none;
  background-color: var(--color-card-background);
  color: var(--color-card-foreground);
  transition: all 0.3s ease-in-out;
  text-align: center;
  
  &:hover {
    transform: rotate(-1deg) translateY(-3px);
    box-shadow: 2px 4px 0 var(--color-card-shadow);
  }
  
  .tag-name {
    font-weight: bold;
    font-size: 1.125rem;
    color: var(--color-foreground);
    margin-bottom: 0.5rem;
    display: inline-block;
    background: var(--color-primary);
    color: #2D2D2D;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
  }
  
  .tag-count {
    font-size: 0.875rem;
    opacity: 0.7;
    color: var(--color-foreground);
  }
`

export default createRoute(async (c) => {
  const tags = await getAllTags();

  return c.render(
    <section class={tagsSection}>
      <header class={tagsHeader}>
        <h1>Tags</h1>
        <p>Browse posts by tags ({tags.length} tags available)</p>
      </header>
      <div class={tagsGrid}>
        {tags.map(({ tag, count }) => (
          <a 
            href={`/tags/${tag}`} 
            key={tag}
            class={tagCard}
          >
            <div class="tag-name">#{tag}</div>
            <div class="tag-count">{count} {count === 1 ? 'post' : 'posts'}</div>
          </a>
        ))}
      </div>
    </section>
  );
});