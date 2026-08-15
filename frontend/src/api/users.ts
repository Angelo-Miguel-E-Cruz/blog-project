import { apiClient } from "./client";

export interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

export async function fetchAdmins(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<{ users: AdminUser[] }>("/admin/users");
  return data.users;
}

export async function createAdmin(email: string, password: string): Promise<AdminUser> {
  const { data } = await apiClient.post<{ user: AdminUser }>("/admin/users", { email, password });
  return data.user;
}

export async function deleteAdmin(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}