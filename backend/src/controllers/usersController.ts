import { Request, Response, NextFunction } from "express";
import { createAdminSchema } from "../validation/schemas";
import * as userService from "../services/userService";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.listAdmins();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = createAdminSchema.parse(req.body);
    const user = await userService.createAdmin(email, password);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.deleteAdmin(req.session.userId as string, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}