// 記事そのものの検査。frontmatter の書き間違いはビルドを通り抜け、
// 一覧の並びや日付表示が黙って崩れるだけなので、ここで止める。
import { jsx } from "hono/jsx";
import { describe, expect, test } from "vite-plus/test";
import type { MDXModule } from "@/types";
import { extractSlugFromPath, getPostBySlug, getPosts } from "@/lib/post";

const modules = import.meta.glob<MDXModule>("/app/posts/**/*.mdx", { eager: true });

/** 本文を実際に描画した HTML。コードブロック内の "# " などに惑わされない */
const renderBody = async (mod: MDXModule) => {
  if (!mod.default) return "";
  return String(await jsx(mod.default, {}).toString());
};

const entries = Object.entries(modules).map(([path, mod]) => ({
  path,
  slug: extractSlugFromPath(path),
  frontmatter: mod.frontmatter,
  mod,
}));

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

test("記事が1本以上ある", () => {
  expect(entries.length).toBeGreaterThan(0);
});

test("slug が重複しない（ディレクトリが違っても URL は /posts/:slug で衝突する）", () => {
  const slugs = entries.map((e) => e.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});

describe.each(entries)("$path", ({ slug, frontmatter, mod }) => {
  test("slug が URL にそのまま使える", () => {
    expect(slug).toMatch(/^[a-z0-9][a-z0-9_-]*$/);
  });

  test("title と description がある", () => {
    expect(frontmatter.title?.trim()).toBeTruthy();
    expect(frontmatter.description?.trim()).toBeTruthy();
  });

  // YAML の書き方次第で Date オブジェクトになると、文字列前提の処理が壊れる
  test("publishedAt / updatedAt は YYYY-MM-DD の文字列で、更新日は公開日以降", () => {
    expect(frontmatter.publishedAt).toMatch(ISO_DATE);
    expect(Number.isNaN(Date.parse(frontmatter.publishedAt))).toBe(false);
    if (frontmatter.updatedAt !== undefined) {
      expect(frontmatter.updatedAt).toMatch(ISO_DATE);
      expect(frontmatter.updatedAt >= frontmatter.publishedAt).toBe(true);
    }
  });

  test("tags は空でなく、重複しない", () => {
    expect(Array.isArray(frontmatter.tags)).toBe(true);
    expect(frontmatter.tags.length).toBeGreaterThan(0);
    expect(new Set(frontmatter.tags).size).toBe(frontmatter.tags.length);
  });

  // CLAUDE.md「記事執筆ルール」: title が <h1> になるので本文に h1 を書かない
  test("本文に h1 を書いていない", async () => {
    const html = await renderBody(mod);
    expect(html).toContain("<h2");
    expect(html).not.toMatch(/<h1[\s>]/);
  });
});

describe("get* が実際の記事で動く", () => {
  test("getPosts は新しい順", async () => {
    const posts = await getPosts();
    const dates = posts.map((p) => p.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test.each(entries.filter((e) => !e.frontmatter.draft).map((e) => e.slug))(
    "getPostBySlug(%s) が本文と目次を返す",
    async (slug) => {
      const post = await getPostBySlug(slug);
      expect(post?.slug).toBe(slug);
      expect(typeof post?.Content).toBe("function");
      expect(Array.isArray(post?.headings)).toBe(true);
    },
  );
});
