import { PostCard } from "@/components/PostCard";
import { PostSummary } from "@/types";
import { css } from "hono/css";
import { Link } from "./ui/Link";

const recentPostListSectionClass = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
`;

const postListClass = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
`;

const footerClass = css`
  text-align: right;
  font-size: var(--text-2xl);
`;

export const RecentPostList = ({ posts }: { posts: PostSummary[] }) => {
  return (
    <section class={recentPostListSectionClass}>
      <header>
        <h2>Recent Posts</h2>
      </header>
      <div class={postListClass}>
        {posts.map((post) => (
          <PostCard key={post.slug} {...post} />
        ))}
      </div>
      <footer class={footerClass}>
        <Link href="/posts">see more...</Link>
      </footer>
    </section>
  );
};
