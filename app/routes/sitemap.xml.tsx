import { createRoute } from "honox/factory";
import { getPosts } from "@/lib/post";
import { absoluteUrl } from "@/lib/site";

const STATIC_PATHS = ["/", "/posts", "/tags", "/about"];

export default createRoute(async (c) => {
  const posts = await getPosts();

  const urlEntries: { loc: string; lastmod?: string }[] = [
    ...STATIC_PATHS.map((path) => ({ loc: absoluteUrl(c, path) })),
    ...posts.map((post) => ({
      loc: absoluteUrl(c, `/posts/${post.slug}`),
      lastmod: post.updatedAt,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return c.body(body, 200, { "Content-Type": "application/xml; charset=UTF-8" });
});
