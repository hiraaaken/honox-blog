import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/cloudflare'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import ssg from '@hono/vite-ssg'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

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
      client: { input: ['/app/client.ts', '/app/base-styles.css'] }
    }),
    build(),
    ssg({ entry }),
    mdx({
      jsxImportSource: 'hono/jsx',
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter]
    }),
  ]
})
