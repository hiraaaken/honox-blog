import type {
  MDXModule,
  PostSummary,
  PostWithContent,
  TagCount,
  Archive,
  AdjacentPosts,
  GetPosts,
  GetPostBySlug,
  GetPostsByTag,
  GetPostsByYearMonth,
  GetAllTags,
  GetArchives,
  GetAdjacentPosts,
} from "@/types";

export const getPosts: GetPosts = async () => {
  const modules = import.meta.glob<MDXModule>("/app/posts/**/*.mdx");

  const posts: PostSummary[] = await Promise.all(
    Object.entries(modules).map(async ([path, resolver]) => {
      const mod = await resolver();
      const slug = path.match(/([^\/]+)\.mdx$/)?.[1] || "";
      return {
        ...mod.frontmatter,
        slug,
      };
    }),
  );

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
};

export const getPostBySlug: GetPostBySlug = async (slug) => {
  const modules = import.meta.glob<MDXModule>("/app/posts/**/*.mdx");

  const entry = Object.entries(modules).find(([path]) =>
    path.endsWith(`${slug}.mdx`),
  );

  if (!entry) {
    return null;
  }

  const [, resolver] = entry;
  const mod = await resolver();

  if (!mod.default) {
    return null;
  }

  const post: PostWithContent = {
    ...mod.frontmatter,
    slug,
    Content: mod.default,
  };

  return post;
};

export const getAllTags: GetAllTags = async () => {
  const posts = await getPosts();
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const tags: TagCount[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));

  return tags;
};

export const getPostsByTag: GetPostsByTag = async (tag) => {
  const posts = await getPosts();
  return posts.filter((post) => post.tags.includes(tag));
};

export const getArchives: GetArchives = async () => {
  const posts = await getPosts();
  const archiveMap = new Map<string, number>();

  posts.forEach((post) => {
    const date = new Date(post.publishedAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, "0")}`;
    archiveMap.set(key, (archiveMap.get(key) || 0) + 1);
  });

  const archives: Archive[] = Array.from(archiveMap.entries())
    .map(([yearMonth, count]) => {
      const [year, month] = yearMonth.split("-");
      return {
        year: parseInt(year),
        month: parseInt(month),
        yearMonth,
        count,
      };
    })
    .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));

  return archives;
};

export const getPostsByYearMonth: GetPostsByYearMonth = async (yearMonth) => {
  const posts = await getPosts();
  return posts.filter((post) => {
    const date = new Date(post.publishedAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const postYearMonth = `${year}-${month.toString().padStart(2, "0")}`;
    return postYearMonth === yearMonth;
  });
};

export const getAdjacentPosts: GetAdjacentPosts = async (currentSlug) => {
  const posts = await getPosts();
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const adjacentPosts: AdjacentPosts = {
    prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  };

  return adjacentPosts;
};
