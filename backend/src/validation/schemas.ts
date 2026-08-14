import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(300),
  content: z.unknown(), // Tiptap JSON — structurally validated by the editor; sanitized at render time
  status: postStatusSchema.default("DRAFT"),
  excerpt: z.string().trim().max(400).optional(),
  featuredImageUrl: z.string().url().nullish(),
  slug: z.string().trim().max(300).optional(),
});

export const updatePostSchema = createPostSchema.partial();
