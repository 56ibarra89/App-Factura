import { apiClient } from "../../../shared/api";
import type {
  AccessPermission,
  AccessRole,
  AccessRoleDraft,
} from "../model/access-control.types";

export interface AccessControlGateway {
  listPermissions(): Promise<AccessPermission[]>;
  listRoles(): Promise<AccessRole[]>;
  createRole(role: AccessRoleDraft): Promise<AccessRole>;
  updateRole(id: string, role: Partial<AccessRoleDraft>): Promise<AccessRole>;
  deleteRole(id: string): Promise<void>;
}

export const accessControlGateway: AccessControlGateway = {
  listPermissions: () => apiClient("/access-control/permissions"),
  listRoles: () => apiClient("/access-control/roles"),
  createRole: (role) =>
    apiClient("/access-control/roles", {
      method: "POST",
      body: JSON.stringify(role),
    }),
  updateRole: (id, role) =>
    apiClient(`/access-control/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(role),
    }),
  async deleteRole(id) {
    await apiClient(`/access-control/roles/${id}`, { method: "DELETE" });
  },
};
