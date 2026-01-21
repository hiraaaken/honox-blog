# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development**
- `pnpm run dev` - Start development server with host binding (0.0.0.0)
- `pnpm run build` - Build for production (client bundle + server)
- `pnpm run preview` - Preview with Wrangler dev server
- `pnpm run deploy` - Build and deploy to Cloudflare Workers

**Package Management**
- This project uses `pnpm` as the package manager
- `pnpm install` - Install dependencies

**Docker Development**
- `docker-compose up` - Start development server in Docker container (runs on port 5173)

## Architecture

This is a **HonoX** application - a full-stack framework built on Hono that runs on Cloudflare Workers with file-based routing.

### Core Structure
- **Server Entry**: `app/server.ts` - Creates the Hono app instance
- **Client Entry**: `app/client.ts` - Client-side hydration entry point
- **Routing**: File-based routing in `app/routes/` directory
- **Renderer**: `app/routes/_renderer.tsx` - Global JSX renderer with HTML layout
- **Islands Architecture**: Interactive components in `app/islands/` use React-like hooks (`useState`, `useEffect`) from `hono/jsx`
- **Static Components**: Regular components in `app/components/` are server-rendered only

### Key Patterns
- **Route Files**: Use `createRoute()` from `honox/factory` for route handlers
- **JSX**: Uses Hono's JSX runtime (`hono/jsx`) instead of React
- **MDX Blog Posts**: Blog posts stored as MDX files in `app/posts/YYYY/YYYYMM/` structure with frontmatter metadata

### Deployment Target
- **Platform**: Cloudflare Workers
- **Config**: `wrangler.jsonc` with Node.js compatibility enabled
- **Assets**: Served from `dist/` directory after build
- **SSG**: Static site generation via `@hono/vite-ssg`

### Styling System
- **CSS-in-JS**: Uses `css` from `hono/css` for component styles (styled-components pattern)
- **Tailwind CSS**: Uses Tailwind v4 for utility-first styling via Vite plugin
- **Global Styles**: `app/base-styles.css` with CSS custom properties for theming
- **Theme System**: Light/dark mode via `data-theme` attribute on `<html>` and `light-dark()` CSS function
- **Responsive Design**: Container queries with `@container (max-width: 800px)` pattern
- **Hover Interactions**: Use `@media (hover: hover)` to prevent sticky hover on touch devices

### Critical Development Patterns

**Route Creation:**
```tsx
import { createRoute } from 'honox/factory'
export default createRoute((c) => {
  return c.render(<Component />)
})
```

**Component Styling:**
```tsx
import { css } from 'hono/css'
const componentClass = css`
  /* CSS styles here get syntax highlighting */
  @media (hover: hover) {
    &:hover { /* Only apply hover on non-touch devices */ }
  }
`
```

### Blog Post System

**File Structure:**
- **Location**: `app/posts/YYYY/YYYYMM/slug.mdx` format
- **Frontmatter Required**: `title`, `description`, `publishedAt`, `tags[]`
- **Frontmatter Optional**: `updatedAt`, `image`

**Post API (`app/lib/post.ts`):**
```tsx
import { getPosts, getPostBySlug, getAllTags, getPostsByTag, getArchives, getAdjacentPosts } from '@/lib/post'

const posts = await getPosts()           // All posts sorted by publishedAt desc
const post = await getPostBySlug('slug') // Returns { frontmatter, Content } or null
const tags = await getAllTags()          // [{ tag, count }] sorted alphabetically
const filtered = await getPostsByTag('tag')
const archives = await getArchives()     // [{ year, month, yearMonth, count }]
const { prev, next } = await getAdjacentPosts('current-slug')
```

**MDX Processing:**
- Frontmatter via `remark-frontmatter` and `remark-mdx-frontmatter`
- Syntax highlighting with Shiki (GitHub Dark theme)
- Auto-generated heading IDs via `rehype-slug`
- Heading anchor links via `rehype-autolink-headings` (wraps headings with `.heading-link` class)

### Build Process
- **Dual Build**: Client bundle must be built before server (`vite build --mode client && vite build`)
- **Assets**: Served from `dist/` directory after build

### Development Setup
- **TypeScript**: Configured for ESNext with Hono JSX (`jsxImportSource: "hono/jsx"`)
- **Alias**: `@/` maps to `app/` directory
- **No Testing Framework**: This project doesn't include test configurations