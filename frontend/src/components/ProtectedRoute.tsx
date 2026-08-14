import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Client-side route guard for UX only — the real security boundary is the
 * backend's requireAuth middleware on /api/admin/* (design §5, SRS §9.2).
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="text-center py-20 text-ink/50">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  return <Outlet />;
}
