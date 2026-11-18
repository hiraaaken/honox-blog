// Post 関連の型定義
import type { FC } from "hono/jsx";

// === 基本データ型 ===

/** MDXファイルのfrontmatterメタデータ */
export interface FrontMatter {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  /** OGP画像。未指定ならサイト既定の画像になる */
  image?: string;
  /** trueの場合、本番環境では一覧・詳細・タグ・アーカイブに表示されない */
  draft?: boolean;
}

/** MDXコンポーネント型 */
export type MDXComponent = FC;

/** 見出し情報（TOC用） */
export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface groupedHeading {
  parent: Heading;
  children: Heading[];
}

/** import.meta.globで読み込まれるMDXモジュールの型 */
export type MDXModule = {
  frontmatter: FrontMatter;
  headings?: Heading[];
  default?: MDXComponent;
};

/** import.meta.globが返すモジュールマップ */
export type MDXModuleMap = Record<string, () => Promise<MDXModule>>;

// === ドメインモデル ===

/** 投稿の概要情報（リスト表示用） */
export interface PostSummary {
  slug: string;
  title: string;
  image?: string;
  tags: string[];
  description: string;
  publishedAt: string;
  updatedAt: string;
}

/** 本文コンポーネント付き投稿（詳細ページ用） */
export interface PostWithContent extends PostSummary {
  Content: MDXComponent;
  headings: groupedHeading[];
}

/** タグと投稿数 */
export interface TagCount {
  tag: string;
  count: number;
}

/** アーカイブ（年月別の投稿数） */
export interface Archive {
  year: number;
  month: number;
  yearMonth: string; // "YYYY-MM"形式
  count: number;
}

/** 前後の投稿 */
export interface AdjacentPosts {
  prev: PostSummary | null;
  next: PostSummary | null;
}

// === 公開API関数型 ===

/** 全投稿を取得（公開日降順） */
export type GetPosts = () => Promise<PostSummary[]>;

/** slugで投稿を取得 */
export type GetPostBySlug = (slug: string) => Promise<PostWithContent | null>;

/** タグで絞り込んだ投稿を取得 */
export type GetPostsByTag = (tag: string) => Promise<PostSummary[]>;

/** 年月で絞り込んだ投稿を取得 */
export type GetPostsByYearMonth = (yearMonth: string) => Promise<PostSummary[]>;

/** 全タグと投稿数を取得 */
export type GetAllTags = () => Promise<TagCount[]>;

/** 年月別アーカイブを取得 */
export type GetArchives = () => Promise<Archive[]>;

/** 指定投稿の前後の投稿を取得 */
export type GetAdjacentPosts = (slug: string) => Promise<AdjacentPosts>;

// === 内部ユーティリティ関数型 ===

/** パスからslugを抽出 */
export type ExtractSlugFromPath = (path: string) => string;

/** 投稿を公開日降順でソート（同日はslug昇順。入力は変更しない） */
export type SortPostsByDate = <T extends PostSummary>(posts: readonly T[]) => T[];

/** 下書きを表示してよいか（開発時のみ下書きも出す） */
export type IsPublished = (frontmatter: Pick<FrontMatter, "draft">, isDev: boolean) => boolean;

/** h2/h3 の並びを h2 ごとの階層にまとめる（h2 より前の h3 は捨てる） */
export type GroupHeadings = (headings: readonly Heading[]) => groupedHeading[];

/** 公開日を日本時間の "YYYY-MM" にする */
export type ToYearMonth = (iso: string) => string;

/** タグごとの投稿数（タグ名の昇順） */
export type CountTags = (posts: readonly PostSummary[]) => TagCount[];

/** 年月ごとの投稿数（新しい順） */
export type BuildArchives = (posts: readonly PostSummary[]) => Archive[];

/** 一覧（新しい順）の中での前後。prev が新しい側、next が古い側 */
export type FindAdjacent = (posts: readonly PostSummary[], slug: string) => AdjacentPosts;

/** slug に完全一致するモジュールのローダーを探す */
export type FindModuleBySlug = (
  modules: MDXModuleMap,
  slug: string,
) => (() => Promise<MDXModule>) | undefined;
