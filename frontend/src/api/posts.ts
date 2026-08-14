import { apiClient } from "./client";
import type { AdminPostDetail, AdminPostListItem, PostDetail, PublishedPostsPage } from "../types/post";

export async function fetchPublishedPosts(cursor?: string, limit = 10): Promise<PublishedPostsPage> {
  const { data } = await apiClient.get<PublishedPostsPage>("/posts", { params: { cursor, limit } });
  return data;
}

export async function fetchPublishedPostBySlug(slug: string): Promise<PostDetail> {
  const { data } = await apiClient.get<{ post: PostDetail }>(`/posts/${slug}`);
  return data.post;
}

export async function fetchAdminPosts(): Promise<AdminPostListItem[]> {
  const { data } = await apiClient.get<{ posts: AdminPostListItem[] }>("/admin/posts");
  return data.posts;
}

export async function fetchAdminPostById(id: string): Promise<AdminPostDetail> {
  const { data } = await apiClient.get<{ post: AdminPostDetail }>(`/admin/posts/${id}`);
  return data.post;
}

export interface SavePostInput {
  title: string;
  content: unknown;
  status: "DRAFT" | "PUBLISHED";
  excerpt?: string;
  featuredImageUrl?: string | null;
}

export async function createAdminPost(input: SavePostInput): Promise<AdminPostDetail> {
  const { data } = await apiClient.post<{ post: AdminPostDetail }>("/admin/posts", input);
  return data.post;
}

export async function updateAdminPost(id: string, input: Partial<SavePostInput>): Promise<AdminPostDetail> {
  const { data } = await apiClient.put<{ post: AdminPostDetail }>(`/admin/posts/${id}`, input);
  return data.post;
}

export async function deleteAdminPost(id: string): Promise<void> {
  await apiClient.delete(`/admin/posts/${id}`);
}
