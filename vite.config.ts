import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import ssg from '@hono/vite-ssg'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeShiki from '@shikijs/rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeExtractHeadings } from './app/lib/rehype-extract-headings'

const entry = "/app/server.ts"

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: '/app' }
    ]
  },
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ['/app/client.ts', '/app/styles/index.css'] }
    }),
    build(),
    ssg({ entry }),
    mdx({
      jsxImportSource: 'hono/jsx',
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [
        rehypeSlug,
        rehypeExtractHeadings,  // rehypeSlug の後に実行（ID 付与後に見出しを抽出）
        [rehypeAutolinkHeadings, {
          behavior: 'wrap',
          properties: {
            className: ['heading-link']
          }
        }],
        [rehypeShiki, {
          theme: 'github-dark'
        }]
      ]
    }),
  ]
})
