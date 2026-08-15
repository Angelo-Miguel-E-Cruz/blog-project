import { prisma } from "../config/db";

export async function findAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, createdAt: true },
  });
}

export async function countUsers() {
  return prisma.user.count();
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: string, passwordHash: string) {
  return prisma.user.create({
    data: { email, passwordHash, mustChangePassword: true },
    select: { id: true, email: true, createdAt: true },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}