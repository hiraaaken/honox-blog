# CLAUDE.md

## プロジェクト概要
Honox を用いた個人技術ブログ。

## 技術スタック:
- フレームワーク: HonoX（Hono 4.x ベース）
- ランタイム: Cloudflare Workers
- ツールチェーン: [Vite+](https://viteplus.dev/)（`vp`。Vite 8 / Oxlint / Oxfmt / Vitest を束ねる）
- コンテンツ: MDX（Markdown + JSX）
- スタイリング: CSS-in-JS（hono/css）+ CSS Custom Properties
- デプロイ: Cloudflare Workers（Wrangler）

## 開発コマンド

Node と pnpm のバージョンは `vp` が `package.json` の `devEngines.runtime` / `packageManager` から決める。mise や corepack は使わない。

- `vp install` - 依存関係インストール
- `vp run dev` - 開発サーバー起動（0.0.0.0でホストバインド）
- `vp run build` - 本番ビルド（クライアント→サーバーの順で実行）
- `vp run preview` - Wranglerでプレビュー
- `vp run deploy` - ビルド後Cloudflare Workersにデプロイ
- `vp run check` - 整形・lint・型（`vp check`）+ コントラスト + テーマ切り替え
- `vp check --fix` - 整形と lint の自動修正

`vp check`（組み込み）と `vp run check`（package.json のスクリプト）は別物。後者が前者を含む。

開発環境は `.devcontainer/`（Neovim + devcontainers.nvim 想定）。

### 依存の固定

- `hono` は `4.11.7` に固定している。4.11.8 以降は jsx の `Context.Provider` が非同期の子の描画が終わるまで値を戻さなくなり、honox が `hono/css` を使う island の後ろに並ぶ island を `<honox-island>` で包まなくなる（`/about` の `TechStackTag` がハイドレートされない）。上げるときは `grep -o '<honox-island' dist/about.html | wc -l` が 17 のままか確認する
- `shiki` / `@shikijs/rehype` は 3 系に留めている。4 系ではネストした CSS のコード例のハイライトが崩れる

### 整形の対象外

`*.md` / `*.mdx` は Oxfmt の対象外（`vite.config.ts` の `fmt.ignorePatterns`）。埋め込みコードまで整形され、記事のコード例が書き換わるため。

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

