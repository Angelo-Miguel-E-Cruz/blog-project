import { Request, Response, NextFunction } from "express";
import { loginSchema } from "../validation/schemas";
import { verifyCredentials, getUserById } from "../services/authService";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await verifyCredentials(email, password);

    // Regenerate session on login to prevent session fixation.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email } });
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.status(204).send();
  });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) return res.status(401).json({ error: "Not authenticated." });
    const user = await getUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: "Not authenticated." });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
