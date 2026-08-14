import { Router } from "express";
import { listPublished, getBySlug } from "../controllers/postsController";

// Public routes — no auth required (FR-001, FR-003).
const router = Router();

router.get("/", listPublished);
router.get("/:slug", getBySlug);

export default router;
