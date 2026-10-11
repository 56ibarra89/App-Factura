import type { PermissionCode, UserRole } from "../../auth";

export interface AccessPermission {
  id: string;
  code: PermissionCode;
  module: string;
  action: string;
  description: string;
}

export interface AccessRole {
  id: string;
  code: string;
  name: string;
  description?: string;
  baseRole: UserRole;
  isSystem: boolean;
  isActive: boolean;
  permissionCodes: PermissionCode[];
  userCount: number;
}

export interface AccessRoleDraft {
  id?: string;
  name: string;
  description: string;
  baseRole: UserRole;
  isActive: boolean;
  permissionCodes: PermissionCode[];
  isSystem?: boolean;
  code?: string;
}
