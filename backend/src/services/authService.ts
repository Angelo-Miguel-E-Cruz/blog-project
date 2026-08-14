import bcrypt from "bcrypt";
import { prisma } from "../config/db";
import { AppError } from "../middleware/errorHandler";

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Same error for "no such user" and "wrong password" — don't leak which one.
    throw new AppError(401, "Invalid email or password.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password.");
  }

  return { id: user.id, email: user.email };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
}
