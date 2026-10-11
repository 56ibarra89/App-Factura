import { useCallback, useEffect, useState } from "react";
import {
  accessControlGateway,
  type AccessControlGateway,
} from "../api/accessControlGateway";
import type {
  AccessPermission,
  AccessRole,
  AccessRoleDraft,
} from "../model/access-control.types";

export function useAccessControl(
  gateway: AccessControlGateway = accessControlGateway,
) {
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [permissions, setPermissions] = useState<AccessPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextRoles, nextPermissions] = await Promise.all([
        gateway.listRoles(),
        gateway.listPermissions(),
      ]);
      setRoles(nextRoles);
      setPermissions(nextPermissions);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo cargar la seguridad.");
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveRole = useCallback(async (draft: AccessRoleDraft) => {
    setSaving(true);
    setError(null);
    try {
      const saved = draft.id
        ? await gateway.updateRole(draft.id, {
            name: draft.name,
            description: draft.description,
            isActive: draft.isActive,
            permissionCodes: draft.permissionCodes,
          })
        : await gateway.createRole(draft);
      setRoles((current) =>
        draft.id
          ? current.map((role) => (role.id === saved.id ? saved : role))
          : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return saved;
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el rol.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [gateway]);

  const deleteRole = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await gateway.deleteRole(id);
      setRoles((current) => current.filter((role) => role.id !== id));
      return true;
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el rol.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [gateway]);

  return {
    roles,
    permissions,
    loading,
    saving,
    error,
    reload: load,
    saveRole,
    deleteRole,
  };
}
