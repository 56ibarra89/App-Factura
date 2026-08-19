import { createContext, useContext } from "react";
import type { UserRole } from "./user.types";
import type { LogoutResult } from "./auth-service.types";

export interface AuthContextValue {
  isLoggedIn: boolean;
  username: string;
  role: UserRole | null;
  email: string;
  firstName: string;
  lastName: string;
  loading: boolean;
  error: string;
  login(
    username: string,
    password: string,
    remember?: boolean,
  ): Promise<boolean>;
  loginWithPin(pin: string): Promise<boolean>;
  logout(): Promise<LogoutResult>;
  logoutAllDevices(): Promise<LogoutResult>;
  clearError(): void;
  validatePinForAction(
    pin: string,
  ): Promise<{ success: boolean; error?: string }>;
  lockoutTime: number;
  loginLockoutTime: number;
  updateUsername(newUsername: string): void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
