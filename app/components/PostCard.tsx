import { css } from "hono/css";
import { PostSummary } from "@/types";
import { Tag } from "@/components/Tag";

const postCardClass = css`
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
  gap: var(--size-200);
  padding: var(--size-600);
  background-color: var(--color-card-background);
  border: 2px solid var(--color-border);
  border-radius: 1rem;
  box-shadow: var(--card-shadow);
  position: relative;
  transform: translateY(0) scale(1);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  
  @media (hover: hover) {
    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: var(--card-shadow-hover);
    }
  }

  & > a {
    display: inline-block;
    flex: 1;
  }
`

const postCardTitleClass = css`
  display: inline;
  box-decoration-break: clone;
  background: var(--color-primary);
  color: var(--color-neutral-800);
  padding: 0 var(--size-200);
`

const postCardDescriptionClass = css`
  margin-bottom: 1rem;
  font-size: 0.875rem;
`

const footerClass = css`
  display: flex;
  flex-direction: column;
  margin-top: auto;
  position: relative;
  
  & > section {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
  }
  
  & a {
    position: relative;
    z-index: 2;
  }
`

const cardLinkClass = css`
  color: inherit;
  text-decoration: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
`

export const PostCard = ({ slug, title, image, tags, description, publishedAt }: PostSummary) => {
  return (
    <article class={postCardClass}>
      <header>
        <h2 class={postCardTitleClass}>
          <a href={`/posts/${slug}`} class={cardLinkClass}>
            {title}
          </a>
        </h2>
      </header>
      <p class={postCardDescriptionClass}>{description}</p>
      <div class={footerClass}>
        <section>
          {tags.map((tag) => (
            <Tag tag={tag} size="sm" />
          ))}
        </section>
        <time>{new Date(publishedAt).toLocaleDateString("ja-JP")}</time>
      </div>
    </article>
  )
}
