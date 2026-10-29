import build from "@hono/vite-build/cloudflare-workers";
import adapter from "@hono/vite-dev-server/cloudflare";
import honox from "honox/vite";
import { defineConfig, lazyPlugins } from "vite-plus";
import mdx from "@mdx-js/rollup";
import ssg from "@hono/vite-ssg";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { rehypeExtractHeadings } from "./app/lib/rehype-extract-headings";
import { rehypeWrapTables } from "./app/lib/rehype-wrap-tables";

const entry = "/app/server.ts";

export default defineConfig({
  fmt: {
    // 記事とドキュメントは文章なので整形しない。埋め込みコードまで整形され、
    // 記事のコード例（意図して省いたセミコロン等）や揃えた桁が書き換わる。
    ignorePatterns: ["**/*.md", "**/*.mdx"],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: {
    alias: [{ find: "@", replacement: "/app" }],
  },
  plugins: lazyPlugins(() => [
    honox({
      devServer: { adapter },
      client: { input: ["/app/client.ts", "/app/styles/index.css"] },
    }),
    build(),
    ssg({ entry }),
    mdx({
      jsxImportSource: "hono/jsx",
      remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [
        rehypeSlug,
        rehypeExtractHeadings,
        rehypeWrapTables,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: ["heading-link"],
            },
          },
        ],
        [
          rehypeShiki,
          {
            theme: "github-dark",
          },
        ],
      ],
    }),
  ]),
});
