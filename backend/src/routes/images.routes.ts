import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { uploadRateLimiter } from "../middleware/rateLimit";
import { upload, remove } from "../controllers/imagesController";

const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const router = Router();
router.use(requireAuth);

router.post("/", uploadRateLimiter, memoryUpload.single("image"), upload);
router.delete("/:id", remove);

export default router;
