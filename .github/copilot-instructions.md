# HonoX Blog Application - AI Coding Agent Instructions

## Architecture Overview

This is a **HonoX** full-stack framework application running on Cloudflare Workers with file-based routing, islands architecture, and MDX blog functionality.

### Key Framework Patterns

- **JSX Runtime**: Uses `hono/jsx` (NOT React) - import from `'hono/jsx'` for components
- **Route Creation**: Always use `createRoute()` from `'honox/factory'` for route handlers
- **Islands**: Interactive components in `app/islands/` use React hooks (`useState`, `useEffect`)
- **Static Components**: Regular components in `app/components/` are server-rendered only

### Critical File Structure

```
app/
├── server.ts          # App entry - minimal, just createApp()
├── client.ts          # Client hydration entry
├── routes/
│   ├── _renderer.tsx  # Global layout with theme handling
│   ├── index.tsx      # Homepage with createRoute() pattern
│   └── posts/[slug].tsx # Dynamic blog post routes
├── islands/           # Client-side interactive components
├── components/        # Server-side only components
├── lib/post.ts        # Blog post utilities with import.meta.glob
└── posts/YYYY/YYYYMM/ # MDX files with frontmatter
```

### Blog Post System

- **File Pattern**: `app/posts/YYYY/YYYYMM/slug.mdx` (year/month directory structure)
- **Frontmatter**: Required fields: `title`, `publishedAt`, `description`, `tags[]`
- **Dynamic Loading**: Use `import.meta.glob()` in `lib/post.ts` for post discovery
- **Slug Extraction**: Extract from filename pattern `([^\/]+)\.mdx$`

### Styling Approach

- **CSS-in-JS**: Use `css` from `'hono/css'` for component styles
- **Global Styles**: `app/base-styles.css` with CSS custom properties
- **Theme System**: CSS variables switch between light/dark via `data-theme` attribute
- **Responsive**: Container queries with `@container (max-width: 800px)`

### Development Commands

- `pnpm run dev` - Development with host binding (0.0.0.0)
- `pnpm run build` - Dual build: client bundle + server (required order)
- `pnpm run preview` - Wrangler dev server for production testing
- `pnpm run deploy` - Build and deploy to Cloudflare Workers

### Integration Points

- **MDX Processing**: Configured in `vite.config.ts` with frontmatter plugins
- **Alias**: Use `@/` for `app/` directory imports
- **SSG**: Static site generation via `@hono/vite-ssg` with entry point
- **Workers**: Node.js compatibility enabled in `wrangler.jsonc`

### Common Patterns

**Route Handler Example:**
```tsx
import { createRoute } from 'honox/factory'
export default createRoute((c) => {
  return c.render(<Component />)
})
```

**Post Retrieval:**
```tsx
import { getPosts, getPostBySlug } from '@/lib/post'
const posts = await getPosts() // Auto-sorted by publishedAt desc
```

**Styling:**
```tsx
import { css } from 'hono/css'
const myClass = css`
  @container (max-width: 800px) { /* responsive */ }
`
```

### Build Requirements

- Always run client build before server build
- MDX files automatically discovered via glob patterns
- Static assets served from `dist/` after build
- Cloudflare Workers deployment with assets directory