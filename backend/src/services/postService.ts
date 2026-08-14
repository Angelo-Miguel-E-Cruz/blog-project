import { PostStatus } from "@prisma/client";
import { AppError } from "../middleware/errorHandler";
import { encodeCursor } from "../utils/cursor";
import { slugify, withUniqueSuffix } from "../utils/slug";
import { generateExcerpt } from "../utils/excerpt";
import { reconcileOrphanedImages } from "./imageService";
import * as postRepo from "../repositories/postRepository";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 30;

export async function listPublishedPosts(limitParam?: string, cursor?: string) {
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(limitParam ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );

  const rows = await postRepo.findPublishedPosts(limit, cursor);
  const hasMore = rows.length > limit;
  const posts = hasMore ? rows.slice(0, limit) : rows;

  const last = posts[posts.length - 1];
  const nextCursor = hasMore && last?.publishedAt ? encodeCursor(last.publishedAt, last.id) : null;

  return { posts, nextCursor, hasMore };
}

export async function getPublishedPostBySlug(slug: string) {
  const post = await postRepo.findPublishedPostBySlug(slug);
  if (!post) throw new AppError(404, "Post not found.");
  return post;
}

export async function listAllPostsForAdmin() {
  return postRepo.findAllPostsForAdmin();
}

export async function getPostForAdmin(id: string) {
  const post = await postRepo.findPostByIdForAdmin(id);
  if (!post) throw new AppError(404, "Post not found.");
  return post;
}

interface PostInput {
  title: string;
  content?: unknown; // optional at the type level — Zod infers z.unknown() fields this way; defaulted below if missing
  status: PostStatus;
  excerpt?: string; // manual override, if provided
  featuredImageUrl?: string | null;
  slug?: string; // manual override, if provided (edit flow)
}

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };
async function resolveUniqueSlug(title: string, manualSlug: string | undefined, excludeId?: string) {
  const base = slugify(manualSlug || title);
  if (!base) throw new AppError(400, "Could not derive a valid slug from the title.");

  const existing = await postRepo.findPostBySlugExcludingId(base, excludeId);
  if (!existing) return base;

  // Collision — try one suffixed retry, which is sufficient at single-admin scale.
  return withUniqueSuffix(base);
}

export async function createPost(input: PostInput) {
  const slug = await resolveUniqueSlug(input.title, input.slug);
  const content = input.content ?? EMPTY_DOC;
  const excerpt = input.excerpt?.trim() || generateExcerpt(content);

  const post = await postRepo.createPost({
    title: input.title,
    slug,
    content: content as any,
    excerpt,
    excerptIsManual: Boolean(input.excerpt?.trim()),
    featuredImageUrl: input.featuredImageUrl ?? null,
    status: input.status,
    publishedAt: input.status === PostStatus.PUBLISHED ? new Date() : null,
  });

  await reconcileOrphanedImages(post.id, post.content);
  return post;
}

export async function updatePost(id: string, input: Partial<PostInput>) {
  const existing = await postRepo.findPostByIdForAdmin(id);
  if (!existing) throw new AppError(404, "Post not found.");

  const slug =
    input.slug || input.title
      ? await resolveUniqueSlug(input.title ?? existing.title, input.slug, id)
      : existing.slug;

  const willPublishNow = input.status === PostStatus.PUBLISHED && existing.status !== PostStatus.PUBLISHED;

  const excerpt = input.excerpt?.trim()
    ? input.excerpt.trim()
    : existing.excerptIsManual
      ? existing.excerpt
      : generateExcerpt(input.content ?? existing.content);

  const updated = await postRepo.updatePost(id, {
    ...(input.title && { title: input.title }),
    slug,
    ...(input.content !== undefined && { content: input.content as any }),
    excerpt,
    excerptIsManual: Boolean(input.excerpt?.trim()) || existing.excerptIsManual,
    ...(input.featuredImageUrl !== undefined && { featuredImageUrl: input.featuredImageUrl }),
    ...(input.status && { status: input.status }),
    ...(willPublishNow && { publishedAt: new Date() }),
  });

  await reconcileOrphanedImages(id, updated.content);
  return updated;
}

export async function deletePost(id: string) {
  const existing = await postRepo.findPostByIdForAdmin(id);
  if (!existing) throw new AppError(404, "Post not found.");

  // Image rows cascade-delete via the FK (see schema.prisma onDelete: Cascade);
  // storage objects are cleaned up explicitly since Postgres doesn't know about Supabase Storage.
  await reconcileOrphanedImages(id, { type: "doc", content: [] }); // treat as "no images referenced" to purge all
  await postRepo.deletePost(id);
}
