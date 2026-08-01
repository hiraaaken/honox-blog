import { createRoute } from "honox/factory";
import { getPosts } from "@/lib/post";
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/site";

/** フィードに載せる最大件数 */
const FEED_MAX_ITEMS = 20;

/** XMLの特殊文字をエスケープする（& を最初に処理する） */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 日付文字列(YYYY-MM-DD等)をRFC 822形式に変換する */
function toRfc822(date: string): string {
  return new Date(date).toUTCString();
}

export default createRoute(async (c) => {
  const posts = (await getPosts()).slice(0, FEED_MAX_ITEMS);
  const feedUrl = absoluteUrl(c, "/feed.xml");
  const siteUrl = getSiteUrl(c);

  const items = posts
    .map((post) => {
      const url = absoluteUrl(c, `/posts/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  // Content-Type は application/xml にする。
  // @hono/vite-ssg（hono/ssg）は Content-Type から出力ファイルの拡張子を決めるが、
  // application/rss+xml は拡張子マップに無く .html が付与され dist/feed.xml.html になってしまう。
  // application/xml なら dist/feed.xml として正しく事前生成され、静的配信でも拡張子から
  // 正しい Content-Type が付く。RSSリーダーは application/xml でも問題なく解釈する。
  return c.body(body, 200, {
    "Content-Type": "application/xml; charset=UTF-8",
  });
});
