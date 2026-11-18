import { describe, expect, test } from "vite-plus/test";
import type { Heading, MDXModule, MDXModuleMap, PostSummary } from "@/types";
import {
  buildArchives,
  countTags,
  extractSlugFromPath,
  findAdjacent,
  findModuleBySlug,
  groupHeadings,
  isPublished,
  sortPostsByDate,
  toYearMonth,
} from "./post";

const post = (slug: string, publishedAt: string, tags: string[] = []): PostSummary => ({
  slug,
  publishedAt,
  tags,
  title: slug,
  description: "",
  image: "",
  updatedAt: publishedAt,
});

const h = (level: number, id: string): Heading => ({ level, id, text: id });

describe("extractSlugFromPath", () => {
  test("ディレクトリを除いたファイル名が slug になる", () => {
    expect(extractSlugFromPath("/app/posts/2026/202608/kotlin-class-types.mdx")).toBe(
      "kotlin-class-types",
    );
  });

  test("mdx でなければ空文字", () => {
    expect(extractSlugFromPath("/app/posts/readme.md")).toBe("");
  });
});

describe("findModuleBySlug", () => {
  const loader = (name: string) => () =>
    Promise.resolve({ frontmatter: { title: name } } as MDXModule);
  const modules: MDXModuleMap = {
    "/app/posts/2026/01/foo-bar.mdx": loader("foo-bar"),
    "/app/posts/2026/02/bar.mdx": loader("bar"),
  };

  test("slug に完全一致するものを返す", async () => {
    const mod = await findModuleBySlug(modules, "bar")?.();
    expect(mod?.frontmatter.title).toBe("bar");
  });

  // 以前は path.endsWith(`${slug}.mdx`) だったので "bar" が "foo-bar.mdx" に当たりえた
  test("後方一致では当てない", () => {
    const only = { "/app/posts/2026/01/foo-bar.mdx": loader("foo-bar") };
    expect(findModuleBySlug(only, "bar")).toBeUndefined();
  });

  test("無ければ undefined", () => {
    expect(findModuleBySlug(modules, "missing")).toBeUndefined();
  });
});

describe("sortPostsByDate", () => {
  test("公開日の新しい順", () => {
    const sorted = sortPostsByDate([
      post("old", "2025-01-01"),
      post("new", "2026-08-17"),
      post("mid", "2026-03-01"),
    ]);
    expect(sorted.map((p) => p.slug)).toEqual(["new", "mid", "old"]);
  });

  // 同日の投稿は実在する（2026-07-22 が2本）。glob の列挙順に依存させない
  test("同日なら slug の昇順", () => {
    const sorted = sortPostsByDate([post("b", "2026-07-22"), post("a", "2026-07-22")]);
    expect(sorted.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  test("入力を書き換えない", () => {
    const input = [post("old", "2025-01-01"), post("new", "2026-01-01")];
    sortPostsByDate(input);
    expect(input.map((p) => p.slug)).toEqual(["old", "new"]);
  });
});

describe("isPublished", () => {
  test.each([
    { draft: undefined, isDev: false, expected: true },
    { draft: false, isDev: false, expected: true },
    { draft: true, isDev: false, expected: false },
    { draft: true, isDev: true, expected: true },
  ])("draft=$draft, dev=$isDev → $expected", ({ draft, isDev, expected }) => {
    expect(isPublished({ draft }, isDev)).toBe(expected);
  });
});

describe("groupHeadings", () => {
  test("h3 は直前の h2 の子になる", () => {
    expect(groupHeadings([h(2, "a"), h(3, "a1"), h(3, "a2"), h(2, "b")])).toEqual([
      { parent: h(2, "a"), children: [h(3, "a1"), h(3, "a2")] },
      { parent: h(2, "b"), children: [] },
    ]);
  });

  test("最初の h2 より前の h3 と、h2/h3 以外は捨てる", () => {
    expect(groupHeadings([h(3, "orphan"), h(2, "a"), h(4, "deep")])).toEqual([
      { parent: h(2, "a"), children: [] },
    ]);
  });

  test("空なら空", () => {
    expect(groupHeadings([])).toEqual([]);
  });
});

describe("toYearMonth", () => {
  test("日付だけの文字列", () => {
    expect(toYearMonth("2026-08-17")).toBe("2026-08");
  });

  // UTC では 7月末だが日本時間では 8月。実行環境のタイムゾーンに依存しないこと
  test("日本時間で月を決める", () => {
    expect(toYearMonth("2026-07-31T20:00:00Z")).toBe("2026-08");
    expect(toYearMonth("2026-08-01T00:00:00+09:00")).toBe("2026-08");
  });
});

describe("countTags", () => {
  test("タグごとに数え、タグ名の昇順に並べる", () => {
    const tags = countTags([
      post("a", "2026-01-01", ["TypeScript", "CSS"]),
      post("b", "2026-01-02", ["TypeScript"]),
    ]);
    expect(tags).toEqual([
      { tag: "CSS", count: 1 },
      { tag: "TypeScript", count: 2 },
    ]);
  });

  test("投稿が無ければ空", () => {
    expect(countTags([])).toEqual([]);
  });
});

describe("buildArchives", () => {
  test("年月ごとに数え、新しい順に並べる", () => {
    const archives = buildArchives([
      post("a", "2025-09-01"),
      post("b", "2026-08-09"),
      post("c", "2026-08-17"),
    ]);
    expect(archives).toEqual([
      { year: 2026, month: 8, yearMonth: "2026-08", count: 2 },
      { year: 2025, month: 9, yearMonth: "2025-09", count: 1 },
    ]);
  });

  test("年をまたいでも文字列比較で正しく並ぶ（月は2桁）", () => {
    const archives = buildArchives([post("a", "2025-12-01"), post("b", "2026-01-01")]);
    expect(archives.map((a) => a.yearMonth)).toEqual(["2026-01", "2025-12"]);
  });
});

describe("findAdjacent", () => {
  const posts = [
    post("newest", "2026-03-01"),
    post("middle", "2026-02-01"),
    post("oldest", "2026-01-01"),
  ];

  test("prev が新しい側、next が古い側", () => {
    const { prev, next } = findAdjacent(posts, "middle");
    expect(prev?.slug).toBe("newest");
    expect(next?.slug).toBe("oldest");
  });

  test("端では片側が null", () => {
    expect(findAdjacent(posts, "newest").prev).toBeNull();
    expect(findAdjacent(posts, "oldest").next).toBeNull();
  });

  test("見つからなければ両方 null", () => {
    expect(findAdjacent(posts, "missing")).toEqual({ prev: null, next: null });
  });
});
