import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { isAuthenticated, role: userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated())
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && userRole !== role) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};
