import { describe, expect, test } from "vite-plus/test";
import type { Context } from "hono";
import { AUTHOR_NAME, SITE_NAME, buildJsonLd, resolveOgImage, serializeJsonLd } from "./site";

// getSiteUrl が読むのは c.req.url だけ
const ctx = (url: string) => ({ req: { url } }) as unknown as Context;

const base = {
  description: "説明",
  canonicalUrl: "https://example.com/posts/a",
  image: "https://example.com/icon.png",
  siteUrl: "https://example.com",
};

describe("buildJsonLd", () => {
  test("記事は BlogPosting", () => {
    const ld = buildJsonLd({
      ...base,
      type: "article",
      title: "記事",
      publishedAt: "2026-07-22",
      updatedAt: "2026-11-16",
    });
    expect(ld).toMatchObject({
      "@type": "BlogPosting",
      headline: "記事",
      datePublished: "2026-07-22",
      dateModified: "2026-11-16",
      author: { "@type": "Person", name: AUTHOR_NAME },
      mainEntityOfPage: { "@id": base.canonicalUrl },
    });
  });

  test("更新日が無ければ dateModified は公開日", () => {
    const ld = buildJsonLd({ ...base, type: "article", publishedAt: "2026-07-22" });
    expect(ld?.dateModified).toBe("2026-07-22");
  });

  test("トップページは WebSite", () => {
    expect(buildJsonLd({ ...base, type: "website", path: "/" })).toMatchObject({
      "@type": "WebSite",
      name: SITE_NAME,
      url: base.siteUrl,
    });
  });

  test("path 未指定の website はトップ扱い", () => {
    expect(buildJsonLd({ ...base, type: "website" })?.["@type"]).toBe("WebSite");
  });

  test("それ以外のページには出さない", () => {
    expect(buildJsonLd({ ...base, type: "website", path: "/tags" })).toBeNull();
  });
});

describe("serializeJsonLd", () => {
  test("</script> で script 要素が閉じられない", () => {
    const out = serializeJsonLd({ headline: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).headline).toBe("</script><script>alert(1)</script>");
  });

  test("U+2028 / U+2029 をエスケープし、値は保つ", () => {
    const value = `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c`;
    const out = serializeJsonLd({ value });
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
    expect(JSON.parse(out).value).toBe(value);
  });
});

describe("resolveOgImage", () => {
  const c = ctx("https://example.com/posts/a?x=1");

  test("指定が無ければ既定画像を絶対URLで", () => {
    expect(resolveOgImage(c)).toBe("https://example.com/icon.png");
  });

  test("相対パスはオリジンを付ける", () => {
    expect(resolveOgImage(c, "/og/a.png")).toBe("https://example.com/og/a.png");
  });

  test("絶対URLはそのまま", () => {
    expect(resolveOgImage(c, "https://cdn.example.net/a.png")).toBe(
      "https://cdn.example.net/a.png",
    );
  });
});
