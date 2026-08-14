import { Request, Response, NextFunction } from "express";

// Extend express-session's data shape.
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

/**
 * Enforces admin authentication server-side (design §5, SRS §9.2).
 * The frontend route-guards for UX, but this is the actual security boundary —
 * every /api/admin/* route goes through this regardless of what the client sends.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required." });
  }
  next();
}
