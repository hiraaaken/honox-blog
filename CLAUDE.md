# CLAUDE.md

## プロジェクト概要
Honox を用いた個人技術ブログ。

## 技術スタック:
- フレームワーク: HonoX（Hono 4.x ベース）
- ランタイム: Cloudflare Workers
- ビルドツール: Vite (7.x)
- コンテンツ: MDX（Markdown + JSX）
- スタイリング: CSS-in-JS（hono/css）+ CSS Custom Properties
- デプロイ: Cloudflare Workers（Wrangler）

## 開発コマンド

- `pnpm run dev` - 開発サーバー起動（0.0.0.0でホストバインド）
- `pnpm run build` - 本番ビルド（クライアント→サーバーの順で実行）
- `pnpm run preview` - Wranglerでプレビュー
- `pnpm run deploy` - ビルド後Cloudflare Workersにデプロイ
- `docker-compose up` - Docker開発環境（ポート5173）

### ディレクトリ構成
- `app/server.ts` - Honoアプリインスタンス作成
- `app/client.ts` - クライアントサイドハイドレーション
- `app/routes/` - ファイルベースルーティング
- `app/routes/_renderer.tsx` - グローバルJSXレンダラー（HTMLレイアウト）
- `app/islands/` - インタラクティブコンポーネント（`useState`, `useEffect`使用）
- `app/components/` - サーバーレンダリング専用コンポーネント

## 設計方針
- CSS-in-JS（`hono/css`）とCSS Custom Propertiesでスタイリング
- MDXでブログ記事を作成（Markdown + JSX）
- オブジェクト・関数は型定義を先行させ、実装を後に書く（Type-First）
- 関数は可能な限り純粋関数として設計し、副作用を最小限に抑える

## 詳細ドキュメント

- コーディング規約: ./.claude/rules/coding-standards.md
- デザインシステム: ./.claude/rules/design-system.md

