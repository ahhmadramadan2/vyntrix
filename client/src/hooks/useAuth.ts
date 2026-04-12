import { useAuthStore } from "../store/authStore";
import type { Student } from "../types";

export const useAuth = () => {
  const { user, token, role, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const isStudent = role === "STUDENT";
  const isHR      = role === "HR";
  const student   = isStudent ? (user as Student) : null;

  return { user, token, role, setAuth, clearAuth, isAuthenticated, isStudent, isHR, student };
};