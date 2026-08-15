import bcrypt from "bcrypt";
import { AppError } from "../middleware/errorHandler";
import * as userRepo from "../repositories/userRepository";

export async function listAdmins() {
  return userRepo.findAllUsers();
}

export async function createAdmin(email: string, password: string) {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    throw new AppError(409, "An admin with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  return userRepo.createUser(email, passwordHash);
}

export async function deleteAdmin(requesterId: string, targetId: string) {
  if (requesterId === targetId) {
    throw new AppError(400, "You can't remove your own account while logged in as it.");
  }

  const total = await userRepo.countUsers();
  if (total <= 1) {
    throw new AppError(400, "Can't remove the last remaining admin account.");
  }

  await userRepo.deleteUser(targetId);
}