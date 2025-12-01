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

## Architecture

This is a **HonoX** application - a full-stack framework built on Hono that runs on Cloudflare Workers with file-based routing.

### Core Structure
- **Server Entry**: `app/server.ts` - Creates the Hono app instance
- **Client Entry**: `app/client.ts` - Client-side hydration entry point
- **Routing**: File-based routing in `app/routes/` directory
- **Renderer**: `app/routes/_renderer.tsx` - Global JSX renderer with HTML layout
- **Islands Architecture**: Interactive components in `app/islands/`

### Key Patterns
- **Route Files**: Use `createRoute()` from `honox/factory` for route handlers
- **JSX**: Uses Hono's JSX runtime (`hono/jsx`) instead of React
- **MDX Blog Posts**: Blog posts stored as MDX files in `app/posts/YYYY/YYYYMM/` structure with frontmatter metadata
- **Post Management**: `app/lib/post.ts` handles dynamic imports and sorting of MDX files

### Deployment Target
- **Platform**: Cloudflare Workers
- **Config**: `wrangler.jsonc` with Node.js compatibility enabled
- **Assets**: Served from `dist/` directory after build

### Styling System
- **CSS-in-JS**: Uses `css` from `hono/css` for component styles (styled-components pattern)
- **Global Styles**: `app/base-styles.css` with CSS custom properties for theming
- **Theme System**: Light/dark mode via CSS variables that switch based on `data-theme` attribute
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

**Post Management:**
- Use `import.meta.glob()` in `lib/post.ts` for dynamic MDX file discovery
- Posts auto-sorted by `publishedAt` in descending order
- Slug extracted from filename pattern: `([^\/]+)\.mdx$`

### Build Process
- **Dual Build**: Client bundle must be built before server (`vite build --mode client && vite build`)
- **Assets**: Served from `dist/` directory after build
- **SSG**: Static site generation enabled for better performance

### Development Setup
- **TypeScript**: Configured for ESNext with Hono JSX
- **MDX**: Frontmatter processing with remark plugins
- **Alias**: `@/` maps to `app/` directory