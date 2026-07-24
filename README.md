
# hiraaaken.dev 🔥

hiraaaken（Kenta Hirakata）のテックブログ 🥦

## 技術スタック

- **フレームワーク**: [HonoX](https://github.com/honojs/honox) (フルスタックHonoフレームワーク)
- **ランタイム**: Cloudflare Workers
- **ビルドツール**: Vite 6.x
- **スタイリング**: CSS-in-JS (hono/css) 
- **シンタックスハイライト**: Shiki
- **パッケージマネージャー**: pnpm

## 開発

### 必要な環境

- Docker と Docker Compose
- pnpm（ローカルで実行する場合）

### Dockerでのセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/hiraaaken/honox-blog.git
cd honox-blog

# 開発サーバーを起動
docker compose up
```

アプリケーションは `http://localhost:5173` で利用できます。

### ローカル開発

```bash
# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm run dev

# 本番用ビルド
pnpm run build

# 本番ビルドをプレビュー
pnpm run preview
```

## デプロイ

Cloudflare Workersへのデプロイ:

```bash
pnpm run deploy
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
- **Docker**: `compose.yaml` - 開発環境設定

## ライセンス

MIT
