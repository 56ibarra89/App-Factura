import type { UserRole } from "./user.types";
import type { PermissionCode } from "./permission.types";

export interface AuthLoginResult {
  success: boolean;
  username?: string;
  role?: UserRole;
  email?: string;
  firstName?: string;
  lastName?: string;
  access_token?: string;
  themePreference?: string;
  errorMessage?: string;
  accessRoleId?: string;
  accessRoleName?: string;
  permissions?: PermissionCode[];
}

export interface LogoutResult {
  success: boolean;
  message?: string;
}

export interface AuthPinLoginSuccess {
  success: true;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  access_token: string;
  themePreference: string;
  accessRoleId?: string;
  accessRoleName?: string;
  permissions: PermissionCode[];
}

export interface AuthPinLoginFailure {
  success: false;
  retryAfterSeconds?: number;
  errorMessage?: string;
}

export type AuthPinLoginResult =
  | AuthPinLoginSuccess
  | AuthPinLoginFailure;

export interface IAuthService {
  login(username: string, password: string): Promise<AuthLoginResult>;
  loginWithPin(pin: string): Promise<AuthPinLoginResult>;
  requestPasswordReset(identifier: string): Promise<{ success: boolean; message?: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }>;
  logout(): Promise<LogoutResult>;
  logoutAllDevices(): Promise<LogoutResult>;
  refreshToken(): Promise<string | null>;
}

