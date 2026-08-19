import type { UserRole } from "./user.types";

export interface AuthLoginResult {
  success: boolean;
  username?: string;
  role?: UserRole;
  email?: string;
  firstName?: string;
  lastName?: string;
  access_token?: string;
  themePreference?: string;
}

export interface LogoutResult {
  success: boolean;
  message?: string;
}

export interface IAuthService {
  login(username: string, password: string): Promise<AuthLoginResult>;
  loginWithPin(pin: string): Promise<{ username: string; role: UserRole; firstName: string; lastName: string; access_token: string; themePreference: string } | null>;
  requestPasswordReset(identifier: string): Promise<{ success: boolean; message?: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }>;
  logout(): Promise<LogoutResult>;
  logoutAllDevices(): Promise<LogoutResult>;
}
