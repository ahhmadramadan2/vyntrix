import { create } from "zustand";
import type { Student, HrUser, UserRole } from "../types";

interface AuthStore {
  user: Student | HrUser | null;
  token: string | null;
  role: UserRole | null;
  setAuth: (user: Student | HrUser, token: string, role: UserRole) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

// Load persisted auth from localStorage on app start
const savedToken = localStorage.getItem("vyntrix_token");
const savedUser  = localStorage.getItem("vyntrix_user");
const savedRole  = localStorage.getItem("vyntrix_role");

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: savedToken || null,
  user:  savedUser ? JSON.parse(savedUser) : null,
  role:  (savedRole as UserRole) || null,

  setAuth: (user, token, role) => {
    // Persist to localStorage so auth survives page refresh
    localStorage.setItem("vyntrix_token", token);
    localStorage.setItem("vyntrix_user", JSON.stringify(user));
    localStorage.setItem("vyntrix_role", role);
    set({ user, token, role });
  },

  clearAuth: () => {
    localStorage.removeItem("vyntrix_token");
    localStorage.removeItem("vyntrix_user");
    localStorage.removeItem("vyntrix_role");
    set({ user: null, token: null, role: null });
  },

  isAuthenticated: () => !!get().token,
}));