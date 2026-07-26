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

パッケージマネージャーは [aube](https://aube.jdx.dev/)（mise作者jdx製、pnpm-lock.yaml互換）。ツールチェーンは[mise](https://mise.jdx.dev/)で管理する（`mise.toml`にNode/aubeのバージョンを宣言）。

- `mise install` - mise.tomlで宣言したツール（Node/aube）をインストール
- `aube install` - 依存関係インストール
- `aube run dev` - 開発サーバー起動（0.0.0.0でホストバインド）
- `aube run build` - 本番ビルド（クライアント→サーバーの順で実行）
- `aube run preview` - Wranglerでプレビュー
- `aube run deploy` - ビルド後Cloudflare Workersにデプロイ
- `docker compose up` - Docker開発環境（素のUbuntu + mise + aube、ポート5173）

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

## 記事執筆ルール
- 記事タイトル（`# 見出し`相当）はfrontmatterの`title`のみで管理する。本文中に`# 見出し`（h1）を書かない
  - 記事詳細ページ（`app/routes/posts/[slug].tsx`）が`title`を`<h1>`として描画するため、本文にh1を書くと見出しが重複する
  - 本文の見出しは`## 見出し`（h2）から開始する

## 詳細ドキュメント

- コーディング規約: ./.claude/rules/coding-standards.md
- デザインシステム: ./.claude/rules/design-system.md

