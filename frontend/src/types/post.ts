export type PostStatus = "DRAFT" | "PUBLISHED";

// Minimal shape for Tiptap's JSON document — kept loose here; the editor
// library owns the full schema.
export type RichTextContent = {
  type: string;
  content?: unknown[];
};

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: string | null;
}

export interface PostDetail extends PostSummary {
  content: RichTextContent;
}

export interface AdminPostListItem {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  updatedAt: string;
  publishedAt: string | null;
}

export interface AdminPostDetail {
  id: string;
  title: string;
  slug: string;
  content: RichTextContent;
  excerpt: string | null;
  excerptIsManual: boolean;
  featuredImageUrl: string | null;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface PublishedPostsPage {
  posts: PostSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}
