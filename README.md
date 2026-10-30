
# hiraaaken.dev 🔥

hiraaaken（Kenta Hirakata）のテックブログ 🥦

## 技術スタック

- **フレームワーク**: [HonoX](https://github.com/honojs/honox) (フルスタックHonoフレームワーク)
- **ランタイム**: Cloudflare Workers
- **ツールチェーン**: [Vite+](https://viteplus.dev/)（`vp`。Vite 8 / Oxlint / Oxfmt / Vitest）
- **スタイリング**: CSS-in-JS (hono/css) 
- **シンタックスハイライト**: Shiki
- **パッケージマネージャー**: pnpm（バージョンは `vp` が `packageManager` から選ぶ）

## 開発

### 必要な環境

- [Vite+](https://viteplus.dev/)（`curl -fsSL https://vite.plus | bash`）。Node と pnpm は `vp` が `package.json` の宣言に従って用意する、または
- devcontainer（Docker）

### ローカル開発

```bash
# 依存関係をインストール（Node / pnpm も必要なら取得される）
vp install

# 開発サーバーを起動
vp run dev

# 本番用ビルド
vp run build

# 本番ビルドをプレビュー
vp run preview

# 整形・lint・型 + コントラスト + テーマ切り替えの検査
vp run check
```

アプリケーションは `http://localhost:5173` で利用できます。

### devcontainer

`.devcontainer/` に Ubuntu + Vite+ の構成がある。Neovim なら [devcontainers.nvim](https://github.com/jedrzejboczar/devcontainers.nvim) などで開く。
`node_modules` は named volume（ホストの `node_modules` とは別物）。

コンテナ内の LSP は `node_modules` のものをそのまま使う。

| 用途 | コマンド |
|---|---|
| TypeScript 7 | `node_modules/.bin/tsc --lsp --stdio` |
| Oxlint | `vp lint --lsp` |
| Oxfmt | `vp fmt --lsp` |

## デプロイ

Cloudflare Workersへのデプロイ（`main` への push で GitHub Actions からも実行される）:

```bash
vp run deploy
```

## プロジェクト構造

```
app/
├── components/          # サーバーサイドコンポーネント
│   ├── home/            # ホームページ専用コンポーネント
│   └── ui/              # UIプリミティブ（アイコン等）
├── islands/             # インタラクティブなクライアントサイドコンポーネント
├── lib/                 # ユーティリティ関数
├── posts/               # MDXブログ投稿 (YYYY/YYYYMM/slug.mdx)
├── routes/              # ファイルベースルーティング
│   ├── about/
│   ├── archive/
│   ├── posts/
│   └── tags/
├── styles/              # グローバルCSSスタイル
├── types/               # TypeScript型定義
├── client.ts            # クライアントサイドエントリーポイント
└── server.ts            # サーバーサイドエントリーポイント
```

## ブログ投稿の追加

`app/posts/YYYY/YYYYMM/` ディレクトリに新しいブログ投稿を作成:

```mdx
---
title: "投稿のタイトル"
description: "投稿の説明"
publishedAt: "2025-01-01"
tags: ["タグ1", "タグ2"]
---

# ここにコンテンツ

MDX形式でブログ投稿のコンテンツを書きます。
```

## 設定

- **Wrangler**: `wrangler.jsonc` - Cloudflare Workers設定
- **TypeScript**: `tsconfig.json` - TypeScript設定
- **Vite**: `vite.config.ts` - ビルド設定
- **Node / pnpm**: `package.json` の `devEngines.runtime` / `packageManager`（`vp` が読む）
- **devcontainer**: `.devcontainer/` - コンテナ開発環境設定（Ubuntu + Vite+）

## ライセンス

MIT
