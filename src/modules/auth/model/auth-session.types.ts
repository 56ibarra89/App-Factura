import type { UserRole } from "./user.types";
import type { PermissionCode } from "./permission.types";

export interface AuthenticatedUser {
  username: string;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  accessRoleId?: string;
  accessRoleName?: string;
  permissions: PermissionCode[];
}

export interface AuthSessionState {
  isLoggedIn: boolean;
  username: string;
  role: UserRole | null;
  email: string;
  firstName: string;
  lastName: string;
  accessRoleId?: string;
  accessRoleName?: string;
  permissions: PermissionCode[];
}

export const EMPTY_AUTH_SESSION: AuthSessionState = {
  isLoggedIn: false,
  username: "",
  role: null,
  email: "",
  firstName: "",
  lastName: "",
  accessRoleId: undefined,
  accessRoleName: undefined,
  permissions: [],
};
