import axios from "axios";

// Session cookie auth (design §5) — withCredentials sends/receives the HttpOnly cookie.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});
