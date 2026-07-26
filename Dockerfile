FROM ubuntu:24.04

# 基本ツール（mise のダウンロードと git 操作に必要な最小限）
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

# mise（ツールチェーン管理）のインストール
RUN curl https://mise.run | sh
ENV PATH="/root/.local/bin:/root/.local/share/mise/shims:${PATH}"

WORKDIR /app

# mise.toml に宣言した node / aube をインストール
COPY mise.toml ./
RUN mise trust && mise install

# 開発サーバー起動（aube install → dev サーバー起動）
CMD ["sh", "-c", "aube install && aube run dev"]
