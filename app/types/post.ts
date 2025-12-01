// Post 関連の型定義
export interface FrontMatter {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  image: string;
}

export interface PostSummary {
  slug: string,
  title: string,
  image: string,
  tags: string[],
  description: string,
  publishedAt: string,
}
