import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listAll, getById, create, update, remove } from "../controllers/adminPostsController";

// Every route here requires an authenticated admin session (design §4.3, SRS §9.2).
const router = Router();
router.use(requireAuth);

router.get("/", listAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
