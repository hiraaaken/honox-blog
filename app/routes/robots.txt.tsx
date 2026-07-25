import { createRoute } from "honox/factory";
import { absoluteUrl } from "@/lib/site";

export default createRoute((c) => {
  const body = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl(c, "/sitemap.xml")}
`;

  return c.body(body, 200, { "Content-Type": "text/plain; charset=UTF-8" });
});
