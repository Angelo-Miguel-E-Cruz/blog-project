import { Router } from "express";
import { login, logout, me, changePassword } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { loginRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/login", loginRateLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", me);
router.put("/password", requireAuth, changePassword);

export default router;