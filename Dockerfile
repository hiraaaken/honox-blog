FROM node:22-slim

# LSP サーバ & Biome
RUN npm install -g typescript typescript-language-server biome pnpm

WORKDIR /app

# 開発サーバーの起動
CMD ["pnpm", "ci", "&&", "pnpm", "run", "dev"]
