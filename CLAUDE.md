# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm run dev` - 開発サーバー起動（0.0.0.0でホストバインド）
- `pnpm run build` - 本番ビルド（クライアント→サーバーの順で実行）
- `pnpm run preview` - Wranglerでプレビュー
- `pnpm run deploy` - ビルド後Cloudflare Workersにデプロイ
- `docker-compose up` - Docker開発環境（ポート5173）

## Architecture

**HonoX**アプリケーション - Cloudflare Workersで動作するファイルベースルーティングのフルスタックフレームワーク。

### Core Structure
- `app/server.ts` - Honoアプリインスタンス作成
- `app/client.ts` - クライアントサイドハイドレーション
- `app/routes/` - ファイルベースルーティング
- `app/routes/_renderer.tsx` - グローバルJSXレンダラー（HTMLレイアウト）
- `app/islands/` - インタラクティブコンポーネント（`useState`, `useEffect`使用）
- `app/components/` - サーバーレンダリング専用コンポーネント

### Key Patterns

**ルート作成:**
```tsx
import { createRoute } from 'honox/factory'
export default createRoute((c) => {
  return c.render(<Component />)
})
```

**スタイリング（CSS-in-JS + テーマ対応）:**
```tsx
import { css } from 'hono/css'
const componentClass = css`
  /* light-dark()でテーマ対応 */
  color: light-dark(#333, #fff);
  background: light-dark(#fff, #1a1a1a);

  /* タッチデバイスでのホバー状態回避 */
  @media (hover: hover) {
    &:hover { opacity: 0.8; }
  }

  /* コンテナクエリでレスポンシブ対応 */
  @container (max-width: 800px) {
    font-size: 14px;
  }
`
```

### Styling System
- **CSS-in-JS**: `hono/css`の`css`テンプレートリテラル
- **テーマ**: `<html data-theme="light|dark">`と`light-dark()` CSS関数
- **グローバルスタイル**: `app/base-styles.css`（CSS custom properties）

### Blog Post System

**ファイル構造:** `app/posts/YYYY/YYYYMM/slug.mdx`

**Frontmatter:**
- 必須: `title`, `description`, `publishedAt`, `tags[]`
- 任意: `updatedAt`, `image`

**Post API (`app/lib/post.ts`):**
```tsx
import { getPosts, getPostBySlug, getAllTags, getPostsByTag, getArchives, getAdjacentPosts } from '@/lib/post'

const posts = await getPosts()           // publishedAt降順
const post = await getPostBySlug('slug') // { frontmatter, Content } | null
const tags = await getAllTags()          // [{ tag, count }]
const archives = await getArchives()     // [{ year, month, yearMonth, count }]
const { prev, next } = await getAdjacentPosts('current-slug')
```

**MDX処理:**
- Shikiによるシンタックスハイライト（GitHub Dark）
- `rehype-slug`で見出しIDを自動生成
- `rehype-autolink-headings`で見出しアンカーリンク（`.heading-link`クラス）

### Development Setup
- **JSX**: `hono/jsx`（Reactではない）
- **Alias**: `@/` → `app/`
- **Platform**: Cloudflare Workers（`wrangler.jsonc`でNode.js互換有効）
- **SSG**: `@hono/vite-ssg`
- **テストフレームワーク**: なし