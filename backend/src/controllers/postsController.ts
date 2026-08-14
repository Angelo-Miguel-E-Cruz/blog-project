import { Request, Response, NextFunction } from "express";
import * as postService from "../services/postService";

/** Public: GET /api/posts?limit&cursor — published only (FR-002). */
export async function listPublished(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit, cursor } = req.query;
    const result = await postService.listPublishedPosts(
      typeof limit === "string" ? limit : undefined,
      typeof cursor === "string" ? cursor : undefined
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** Public: GET /api/posts/:slug — 404s for drafts or missing posts (FR-003, FR-014). */
export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.getPublishedPostBySlug(req.params.slug);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}
