import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  email: string;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await apiClient.post<{ user: AuthUser }>("/auth/login", { email, password });
  return data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await apiClient.get<{ user: AuthUser }>("/auth/me");
    return data.user;
  } catch {
    return null;
  }
}
