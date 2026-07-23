// ページごとのメタ情報（title/description/OGP/canonical用）

/** c.render()の第2引数として各ルートから渡すページメタ情報 */
export interface PageMeta {
  /** 未指定の場合はサイト名のみを<title>に表示 */
  title?: string;
  description?: string;
  /** canonical URL・og:urlの生成に使うパス（例: "/posts/foo"）。未指定時はリクエストパスを使用 */
  path?: string;
  /** OGPのog:type。記事詳細ページのみ"article" */
  type?: "website" | "article";
  /** OGP画像のパスまたは絶対URL。未指定時はサイト共通のデフォルト画像 */
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
}
