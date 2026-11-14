import { apiClient } from "../../../shared/api";
import type {
  AccessPermission,
  AccessRole,
  CreateAccessRoleInput,
  UpdateAccessRoleInput,
} from "../model/access-control.types";

export interface AccessControlGateway {
  listPermissions(): Promise<AccessPermission[]>;
  listRoles(): Promise<AccessRole[]>;
  createRole(role: CreateAccessRoleInput): Promise<AccessRole>;
  updateRole(id: string, role: UpdateAccessRoleInput): Promise<AccessRole>;
  deleteRole(id: string): Promise<void>;
}

export const accessControlGateway: AccessControlGateway = {
  listPermissions: () => apiClient("/access-control/permissions"),
  listRoles: () => apiClient("/access-control/roles"),
  createRole: (role) =>
    apiClient("/access-control/roles", {
      method: "POST",
      body: JSON.stringify({
        name: role.name,
        description: role.description,
        baseRole: role.baseRole,
        permissionCodes: role.permissionCodes,
      }),
    }),
  updateRole: (id, role) =>
    apiClient(`/access-control/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...(role.name !== undefined ? { name: role.name } : {}),
        ...(role.description !== undefined
          ? { description: role.description }
          : {}),
        ...(role.isActive !== undefined ? { isActive: role.isActive } : {}),
        ...(role.permissionCodes !== undefined
          ? { permissionCodes: role.permissionCodes }
          : {}),
      }),
    }),
  async deleteRole(id) {
    await apiClient(`/access-control/roles/${id}`, { method: "DELETE" });
  },
};
