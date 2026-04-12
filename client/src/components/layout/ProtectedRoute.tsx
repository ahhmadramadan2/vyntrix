import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};
