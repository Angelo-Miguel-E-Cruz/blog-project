import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="text-center py-20 text-ink/50">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  if (user.mustChangePassword && location.pathname !== "/admin/change-password") {
    return <Navigate to="/admin/change-password" replace />;
  }

  return <Outlet />;
}