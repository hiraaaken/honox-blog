import { css } from "hono/css";
import CalendarIcon from "@/components/ui/CalendarIcon";
import UpdateIcon from "@/components/ui/UpdateIcon";
import { formatDate, formatUpdatedDate } from "@/lib/date";

interface PostDateProps {
  publishedAt: string;
  updatedAt?: string;
}

const postDateClass = css`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs) var(--spacing-md);
  font-variant-numeric: tabular-nums;

  & > span {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  & svg {
    width: 1em;
    height: 1em;
    flex: none;
  }
`;

export const PostDate = ({ publishedAt, updatedAt }: PostDateProps) => {
  const hasUpdate = Boolean(updatedAt) && updatedAt !== publishedAt;

  return (
    <span class={postDateClass} data-post-date>
      <span>
        <CalendarIcon />
        <span class="visually-hidden">公開日</span>
        <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
      </span>
      {hasUpdate && updatedAt && (
        <span>
          <UpdateIcon />
          <span class="visually-hidden">更新日</span>
          <time dateTime={updatedAt}>
            {formatUpdatedDate(updatedAt, publishedAt)}
          </time>
        </span>
      )}
    </span>
  );
};
