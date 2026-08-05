import type { Context } from "hono";

export const SITE_NAME = "hiraaaken.dev";

export const AUTHOR_NAME = "hiraaaken";

export const DEFAULT_DESCRIPTION =
  "hiraaakenのテックブログ。日々の学びや気づきを書き留めています。";

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

interface JsonLdInput {
  /** ページ種別。"article"なら記事(BlogPosting)、"/"のwebsiteならサイト(WebSite) */
  type: "website" | "article";
  path?: string;
  title?: string;
  /** フォールバック適用後の説明文 */
  description: string;
  /** 絶対URL（canonical） */
  canonicalUrl: string;
  /** 絶対URLのOGP画像 */
  image: string;
  /** サイトのオリジン（WebSite用） */
  siteUrl: string;
  publishedAt?: string;
  updatedAt?: string;
}

/**
 * ページに埋め込むJSON-LD構造化データを組み立てる。
 * - 記事詳細（type="article"）: BlogPosting
 * - トップページ（path="/"）: WebSite
 * - それ以外: null（構造化データを出力しない）
 */
export function buildJsonLd(input: JsonLdInput): Record<string, unknown> | null {
  if (input.type === "article") {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: input.title ?? SITE_NAME,
      description: input.description,
      datePublished: input.publishedAt,
      dateModified: input.updatedAt ?? input.publishedAt,
      author: { "@type": "Person", name: AUTHOR_NAME },
      publisher: { "@type": "Person", name: AUTHOR_NAME },
      image: input.image,
      url: input.canonicalUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": input.canonicalUrl },
    };
  }

  if ((input.path ?? "/") === "/") {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      description: input.description,
      url: input.siteUrl,
      author: { "@type": "Person", name: AUTHOR_NAME },
    };
  }

  return null;
}

/**
 * JSON-LDを<script>に安全に埋め込むための文字列化。
 * "</script>"によるタグ早期終了を防ぐため "<" を、JSで無効な行区切り文字
 * (U+2028 LINE SEPARATOR / U+2029 PARAGRAPH SEPARATOR)を \uXXXX にエスケープする。
 * パターンはソースに不可視文字を残さないよう char code から組み立てる。
 */
export function serializeJsonLd(obj: Record<string, unknown>): string {
  const lineSep = String.fromCharCode(0x2028);
  const paraSep = String.fromCharCode(0x2029);
  const pattern = new RegExp("[<" + lineSep + paraSep + "]", "g");
  return JSON.stringify(obj).replace(pattern, (ch) => {
    const code = ch.charCodeAt(0).toString(16).padStart(4, "0");
    return "\\u" + code;
  });
}
