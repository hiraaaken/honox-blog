FROM node:22-slim

# LSP サーバ & Biome
RUN npm install -g typescript typescript-language-server biome

# mise（ツールチェーン管理）のインストール
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && curl https://mise.run | sh
ENV PATH="/root/.local/bin:/root/.local/share/mise/shims:${PATH}"

WORKDIR /app
COPY mise.toml ./
RUN mise trust && mise install

# 開発サーバーの起動（aube install → dev サーバー起動）
CMD ["sh", "-c", "aube install && aube run dev"]
