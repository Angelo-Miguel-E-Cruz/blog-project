import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { processAndStoreImage, deleteImageById } from "../services/imageService";

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, "No image file provided.");
    const postId = typeof req.body.postId === "string" ? req.body.postId : undefined;
    const result = await processAndStoreImage(req.file, postId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteImageById(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
