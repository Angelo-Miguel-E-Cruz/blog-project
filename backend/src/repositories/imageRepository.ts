import { prisma } from "../config/db";

export async function createImageRecord(data: {
  postId?: string | null;
  storagePath: string;
  imageUrl: string;
}) {
  return prisma.image.create({ data });
}

export async function findImagesByPostId(postId: string) {
  return prisma.image.findMany({ where: { postId } });
}

export async function deleteImageRecords(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.image.deleteMany({ where: { id: { in: ids } } });
}

export async function findImageById(id: string) {
  return prisma.image.findUnique({ where: { id } });
}
