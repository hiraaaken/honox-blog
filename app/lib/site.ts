import type { Context } from "hono";

export const SITE_NAME = "hiraaaken Blog";

export const DEFAULT_DESCRIPTION =
  "関西在住のエンジニアhiraaakenによる個人技術ブログ。TypeScript・CSS・Honoまわりの学びを書き留めています。";

/** カスタムドメイン導入（#49）までの暫定フォールバック画像 */
export const DEFAULT_OG_IMAGE_PATH = "/icon.png";

/**
 * 本番サイトのURL。VITE_SITE_URLが未設定の場合はリクエストのoriginにフォールバックする。
 *
 * hono/ssg（@hono/vite-ssg）は静的生成時にbaseURLを"http://localhost"に固定するため、
 * SSGで事前生成されるページ（/、/posts、/tags、/about）はビルド後もWorkerを経由せず
 * 静的ファイルとして配信され、リクエストoriginから正しいURLを得られない。
 * VITE_SITE_URLを設定するとビルド時に値が埋め込まれ、SSG/SSRいずれのページでも
 * 正しいcanonical/og:urlになる。カスタムドメイン設定（#49）時に設定すること。
 */
export const SITE_URL = import.meta.env.VITE_SITE_URL || "";

/**
 * サイトのオリジンを取得する。
 * VITE_SITE_URL未設定時は、SSRルートであればリクエストのoriginにフォールバックするが、
 * SSGで静的生成されるページでは"http://localhost"になる制限がある（上記参照）。
 */
export function getSiteUrl(c: Context): string {
  return SITE_URL || new URL(c.req.url).origin;
}

export function absoluteUrl(c: Context, path: string): string {
  return `${getSiteUrl(c)}${path}`;
}

export function resolveOgImage(c: Context, image?: string): string {
  const path = image || DEFAULT_OG_IMAGE_PATH;
  return path.startsWith("http") ? path : absoluteUrl(c, path);
}
