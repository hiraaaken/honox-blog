
# hiraaaken.dev 🔥

hiraaaken（Kenta Hirakata）のテックブログ 🥦

## 技術スタック

- **フレームワーク**: [HonoX](https://github.com/honojs/honox) (フルスタックHonoフレームワーク)
- **ランタイム**: Cloudflare Workers
- **ビルドツール**: Vite 6.x
- **スタイリング**: CSS-in-JS (hono/css) 
- **シンタックスハイライト**: Shiki
- **ツールチェーン管理**: [mise](https://mise.jdx.dev/)
- **パッケージマネージャー**: [aube](https://aube.jdx.dev/)（mise作者jdx製、pnpm-lock.yaml互換）

## 開発

### 必要な環境

- [mise](https://mise.jdx.dev/)（ツールチェーン管理。Node/aube を `mise.toml` に宣言）、または
- Docker / Docker Compose

### ローカル開発（mise）

```bash
# ツールチェーン（Node/aube）をインストール
mise install

# 依存関係をインストール
aube install

# 開発サーバーを起動
aube run dev

# 本番用ビルド
aube run build

# 本番ビルドをプレビュー
aube run preview
```

アプリケーションは `http://localhost:5173` で利用できます。

### Docker Composeでのセットアップ

素の Ubuntu イメージに mise を入れ、`mise.toml` の宣言に従って Node と aube をインストールする構成（`Dockerfile`）。

```bash
docker compose up
```

## デプロイ

Cloudflare Workersへのデプロイ:

```bash
aube run deploy
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
- **mise**: `mise.toml` - Node/aubeのバージョン管理
- **Docker**: `Dockerfile` / `compose.yaml` - コンテナ開発環境設定（素のUbuntu + mise + aube）

## ライセンス

MIT
