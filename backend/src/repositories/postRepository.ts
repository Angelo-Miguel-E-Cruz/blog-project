import { Prisma, PostStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { decodeCursor } from "../utils/cursor";

const PUBLIC_POST_LIST_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImageUrl: true,
  publishedAt: true,
} satisfies Prisma.PostSelect;

/** Public, cursor-paginated, published-only listing (design §4.2 / FR-002). */
export async function findPublishedPosts(limit: number, cursor?: string) {
  const decoded = cursor ? decodeCursor(cursor) : null;

  const where: Prisma.PostWhereInput = { status: PostStatus.PUBLISHED };

  const posts = await prisma.post.findMany({
    where,
    select: PUBLIC_POST_LIST_SELECT,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: limit + 1, // fetch one extra to know if there's a next page
    ...(decoded && {
      cursor: { id: decoded.id },
      skip: 1, // skip the cursor row itself
    }),
  });

  return posts;
}

export async function findPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: PostStatus.PUBLISHED },
  });
}

/** Admin listing includes drafts (design §4.3 — separate endpoint, not a query-param toggle). */
export async function findAllPostsForAdmin() {
  return prisma.post.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      publishedAt: true,
    },
  });
}

export async function findPostByIdForAdmin(id: string) {
  return prisma.post.findUnique({ where: { id }, include: { images: true } });
}

export async function findPostBySlugExcludingId(slug: string, excludeId?: string) {
  return prisma.post.findFirst({
    where: { slug, ...(excludeId && { id: { not: excludeId } }) },
  });
}

export async function createPost(data: Prisma.PostCreateInput) {
  return prisma.post.create({ data });
}

export async function updatePost(id: string, data: Prisma.PostUpdateInput) {
  return prisma.post.update({ where: { id }, data });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}
