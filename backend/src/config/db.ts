import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance (design §4.1 — stateless service layer talks to this).
export const prisma = new PrismaClient();
