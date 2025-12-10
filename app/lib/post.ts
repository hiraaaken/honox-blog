import { FrontMatter } from "@/types";

export const getPosts = async () => {
  const modules = import.meta.glob<{ frontmatter: FrontMatter }>(
    "/app/posts/**/*.mdx",
  );

  const posts = await Promise.all(
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

export const getPostBySlug = async (slug: string) => {
  const modules = import.meta.glob<{ frontmatter: FrontMatter; default: any }>(
    "/app/posts/**/*.mdx",
  );

  const entry = Object.entries(modules).find(([path]) =>
    path.endsWith(`${slug}.mdx`),
  );

  if (!entry) {
    return null;
  }

  const [, resolver] = entry;
  const mod = await resolver();

  return {
    ...mod.frontmatter,
    slug,
    Content: mod.default,
  };
};

export const getAllTags = async () => {
  const posts = await getPosts();
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
};

export const getPostsByTag = async (tag: string) => {
  const posts = await getPosts();
  return posts.filter((post) => post.tags.includes(tag));
};

export const getArchives = async () => {
  const posts = await getPosts();
  const archiveMap = new Map<string, number>();

  posts.forEach((post) => {
    const date = new Date(post.publishedAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, "0")}`;
    archiveMap.set(key, (archiveMap.get(key) || 0) + 1);
  });

  return Array.from(archiveMap.entries())
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
};

export const getPostsByYearMonth = async (year: number, month: number) => {
  const posts = await getPosts();
  return posts.filter((post) => {
    const date = new Date(post.publishedAt);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
};

export const getAdjacentPosts = async (currentSlug: string) => {
  const posts = await getPosts();
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  };
};
