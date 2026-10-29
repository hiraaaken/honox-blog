FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Vite+ の版。pnpm-workspace.yaml の catalog（vite-plus）と揃える
ARG VP_VERSION=1.4.0

# 非 root で入れる。root で動かすとバインドマウント先のホスト側に root 所有のファイルが残る
USER vscode
ENV VP_HOME=/home/vscode/.vite-plus

# シェルの rc を読まないプロセス（devcontainers.nvim が起動する LSP など）からも
# vp / node / pnpm を引けるよう、$VP_HOME/env と同じ並びで PATH に載せる
ENV PATH=${VP_HOME}/bin:${PATH}:${VP_HOME}/fallback-bin

# Node と pnpm の実体は vp が package.json の devEngines.runtime / packageManager を見て
# 初回使用時に取得する。イメージには焼かない（版の情報源を package.json に一本化する）
RUN curl -fsSL https://vite.plus | VP_VERSION=${VP_VERSION} VP_NODE_MANAGER=yes bash \
  && echo '. "$VP_HOME/env"' >> ~/.bashrc
