import { css } from "hono/css";

const tagClass = css`
  display: inline-block;
  padding: 0.5rem 0.5rem;
  border-radius: 1rem;
  background-color: var(--color-tag-background);
  color: var(--color-tag-foreground);
  text-decoration: none;
  font-weight: 500;
  transform: translateY(0);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: var(--tag-border);
  box-shadow: var(--tag-shadow);

  @media (hover: hover) {
    &:hover {
      transform: translateY(1.5px);
      box-shadow: var(--tag-shadow-hover);
    }
  }

  &:active {
    transform: translateY(3px);
    box-shadow: var(--tag-shadow-active);
    transition: transform 0.06s ease-out, box-shadow 0.06s ease-out;
  }
  
  &[data-size="sm"] {
    font-size: var(--text-label);
    padding: 0.125rem 0.75rem;
  }
  
  &[data-size="md"] {
    font-size: var(--text-body-sm);
    padding: 0.25rem 0.75rem;
  }
  
  &[data-size="lg"] {
    font-size: var(--text-body);
    padding: 0.375rem 0.75rem;
  }
`;

type TagSize = "sm" | "md" | "lg";

interface TagProps {
  tag: string;
  size?: TagSize;
  count?: number | null;
}

export const Tag = ({ tag, size = "md", count = null }: TagProps) => {
  return (
    <a href={`/tags/${tag}`} class={tagClass} data-size={size}>
      # {tag} {count !== null ? `（${count}）` : ""}
    </a>
  );
};

