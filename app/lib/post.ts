import type {
  MDXModule,
  MDXModuleMap,
  PostWithContent,
  TagCount,
  Archive,
  GetPosts,
  GetPostBySlug,
  GetPostsByTag,
  GetPostsByYearMonth,
  GetAllTags,
  GetArchives,
  GetAdjacentPosts,
  ExtractSlugFromPath,
  SortPostsByDate,
  IsPublished,
  GroupHeadings,
  ToYearMonth,
  CountTags,
  BuildArchives,
  FindAdjacent,
  FindModuleBySlug,
} from "@/types";

// ─── 純粋関数 ────────────────────────────────────────────────────────────────
// import.meta.glob に触れない部分。下の get* はこれらを組み合わせるだけにする。

export const extractSlugFromPath: ExtractSlugFromPath = (path) =>
  path.match(/([^/]+)\.mdx$/)?.[1] ?? "";

export const sortPostsByDate: SortPostsByDate = (posts) =>
  [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() ||
      a.slug.localeCompare(b.slug),
  );

export const isPublished: IsPublished = (frontmatter, isDev) => !frontmatter.draft || isDev;

export const groupHeadings: GroupHeadings = (headings) =>
  headings.reduce<ReturnType<GroupHeadings>>((groups, heading) => {
    if (heading.level === 2) {
      return [...groups, { parent: heading, children: [] }];
    }
    if (heading.level === 3 && groups.length > 0) {
      const last = groups[groups.length - 1];
      return [
        ...groups.slice(0, -1),
        { parent: last.parent, children: [...last.children, heading] },
      ];
    }
    return groups;
  }, []);

// 実行環境のタイムゾーン（Workers は UTC、手元は JST）に結果を左右させない
const yearMonthFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
});

export const toYearMonth: ToYearMonth = (iso) => {
  const parts = yearMonthFormat.formatToParts(new Date(iso));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}`;
};

export const countTags: CountTags = (posts) => {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([tag, count]): TagCount => ({ tag, count })).sort((a, b) =>
    a.tag.localeCompare(b.tag),
  );
};

export const buildArchives: BuildArchives = (posts) => {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const key = toYearMonth(post.publishedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([yearMonth, count]): Archive => {
    const [year, month] = yearMonth.split("-");
    return { year: Number(year), month: Number(month), yearMonth, count };
  }).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
};

export const findAdjacent: FindAdjacent = (posts, slug) => {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: posts[index - 1] ?? null,
    next: posts[index + 1] ?? null,
  };
};

export const findModuleBySlug: FindModuleBySlug = (modules, slug) =>
  Object.entries(modules).find(([path]) => extractSlugFromPath(path) === slug)?.[1];

// ─── import.meta.glob を読む層 ───────────────────────────────────────────────

const loadModules = (): MDXModuleMap => import.meta.glob<MDXModule>("/app/posts/**/*.mdx");

/**
 * ポストの一覧を取得する
 */
export const getPosts: GetPosts = async () => {
  const entries = await Promise.all(
    Object.entries(loadModules()).map(async ([path, resolver]) => {
      const mod = await resolver();
      return { ...mod.frontmatter, slug: extractSlugFromPath(path) };
    }),
  );
  return sortPostsByDate(entries.filter((post) => isPublished(post, import.meta.env.DEV)));
};

/**
 * 特定のポストを取得する
 */
export const getPostBySlug: GetPostBySlug = async (slug) => {
  const resolver = findModuleBySlug(loadModules(), slug);
  if (!resolver) {
    return null;
  }

  const mod = await resolver();
  if (!mod.default || !isPublished(mod.frontmatter, import.meta.env.DEV)) {
    return null;
  }

  const post: PostWithContent = {
    ...mod.frontmatter,
    slug,
    Content: mod.default,
    headings: groupHeadings(mod.headings ?? []),
  };
  return post;
};

export const getAllTags: GetAllTags = async () => countTags(await getPosts());

export const getPostsByTag: GetPostsByTag = async (tag) =>
  (await getPosts()).filter((post) => post.tags.includes(tag));

export const getArchives: GetArchives = async () => buildArchives(await getPosts());

export const getPostsByYearMonth: GetPostsByYearMonth = async (yearMonth) =>
  (await getPosts()).filter((post) => toYearMonth(post.publishedAt) === yearMonth);

export const getAdjacentPosts: GetAdjacentPosts = async (slug) =>
  findAdjacent(await getPosts(), slug);
