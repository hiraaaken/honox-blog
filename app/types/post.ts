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
  image: string;
}

/** MDXコンポーネント型 */
export type MDXComponent = FC;

/** import.meta.globで読み込まれるMDXモジュールの型 */
export type MDXModule = {
  frontmatter: FrontMatter;
  default?: MDXComponent;
}

/** import.meta.globが返すモジュールマップ */
export type MDXModuleMap = Record<string, () => Promise<MDXModule>>;

// === ドメインモデル ===

/** 投稿の概要情報（リスト表示用） */
export interface PostSummary {
  slug: string;
  title: string;
  image: string;
  tags: string[];
  description: string;
  publishedAt: string;
  updatedAt: string;
}

/** 本文コンポーネント付き投稿（詳細ページ用） */
export interface PostWithContent extends PostSummary {
  Content: MDXComponent;
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

/** 投稿を公開日降順でソート */
export type SortPostsByDate = (posts: PostSummary[]) => PostSummary[];
