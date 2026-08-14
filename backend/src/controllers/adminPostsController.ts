import { Request, Response, NextFunction } from "express";
import { createPostSchema, updatePostSchema } from "../validation/schemas";
import * as postService from "../services/postService";

export async function listAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await postService.listAllPostsForAdmin();
    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await postService.getPostForAdmin(req.params.id);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createPostSchema.parse(req.body);
    const post = await postService.createPost(input);
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updatePostSchema.parse(req.body);
    const post = await postService.updatePost(req.params.id, input);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await postService.deletePost(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
