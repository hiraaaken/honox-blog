
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

- [devcontainer](https://containers.dev/) 対応エディタ（推奨）、または
- [mise](https://mise.jdx.dev/) （ローカルで直接実行する場合）

### devcontainerでのセットアップ（推奨）

```bash
# リポジトリをクローン
git clone https://github.com/hiraaaken/honox-blog.git
cd honox-blog
```

VS Code等でリポジトリを開き、devcontainerで再度開く（`.devcontainer/devcontainer.json`）と、mise・aubeのセットアップと依存関係インストールが自動で行われる。

### ローカル開発

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

### Docker Composeでのセットアップ（従来方式・引き続き利用可）

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
- **devcontainer**: `.devcontainer/devcontainer.json` - コンテナ開発環境設定
- **Docker（従来方式）**: `compose.yaml` - 開発環境設定

## ライセンス

MIT
