import { useState, useEffect, useCallback } from "react";
import { UserAccount } from "../types/user";
import { logService } from "../services/logService";
import { useAuth } from "../context/AuthContext";
import {
  usersGateway,
  type UserAdministrationGateway,
  type UserDeliveryStatsGateway,
  type UserMutationPayload,
  type UserScheduleGateway,
} from "../services/users/usersGateway";

export interface AccountManagerGateways {
  administration: UserAdministrationGateway;
  deliveryStats: UserDeliveryStatsGateway;
  schedule: UserScheduleGateway;
}

export function useAccountManager({
  administration = usersGateway,
  deliveryStats = usersGateway,
  schedule = usersGateway,
}: Partial<AccountManagerGateways> = {}) {
  const { username: adminUser, role: adminRole } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios desde el backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await administration.list();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar los usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [administration]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const saveUser = async (user: UserAccount) => {
    setLoading(true);
    setError(null);
    try {
      const isNew = !user.id || user.id === "";
      let savedUser: UserAccount;

      // Limpiar campos antes de enviar al backend
      const payload: UserMutationPayload = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        pin: user.pin,
        role: user.role,
        isActive: user.isActive,
        workDays: user.workDays,
      };

      if (user.email) payload.email = user.email;
      if (user.password && user.password.trim() !== "") {
        payload.password = user.password;
      }

      if (!isNew) {
        // Actualizar existente
        savedUser = await administration.update(user.id, payload);
        
        setUsers(users.map((u) => (u.id === savedUser.id ? savedUser : u)));
        logService.log(
          adminUser,
          adminRole,
          "USER_UPDATE",
          `Usuario actualizado: @${savedUser.username} (${savedUser.firstName} ${savedUser.lastName})`
        );
      } else {
        // Crear nuevo
        savedUser = await administration.create(payload);
        
        setUsers([...users, savedUser]);
        logService.log(
          adminUser,
          adminRole,
          "USER_CREATE",
          `Nuevo usuario creado: @${savedUser.username} (${savedUser.firstName} ${savedUser.lastName})`
        );
      }
      return savedUser; // Éxito
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error al guardar el usuario";
      setError(errMsg);
      console.error(err);
      return null; // Fallo
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    
    // Optimistic UI update
    setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)));

    try {
      await administration.update(userId, { isActive: !user.isActive });
      logService.log(
        adminUser,
        adminRole,
        "USER_UPDATE_STATUS",
        `Usuario @${user.username} ${!user.isActive ? "ACTIVADO" : "DESACTIVADO"}`
      );
    } catch (err) {
      // Revertir si falla
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: user.isActive } : u)));
      console.error("Error toggling user status", err);
    }
  };

  const unlockUser = async (userId: string) => {
    try {
      await administration.unlock(userId);
      logService.log(
        adminUser,
        adminRole,
        "USER_UNLOCK",
        `Usuario desbloqueado: ID ${userId}`
      );
      // Actualizar vista localmente
      setUsers(users.map((u) => (u.id === userId ? { ...u, lockedUntil: undefined, failedLoginAttempts: 0, lockoutLevel: 0 } : u)));
    } catch (err) {
      console.error("Error unlocking user", err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Regla: nadie puede borrar su propia cuenta
    if (user.username === adminUser) {
      setError("No puedes eliminar tu propia cuenta.");
      return;
    }

    // Optimistic UI update
    const previousUsers = [...users];
    setUsers(users.filter((u) => u.id !== userId));

    try {
      await administration.delete(userId);
      logService.log(
        adminUser,
        adminRole,
        "USER_DELETE",
        `Usuario eliminado permanentemente: @${user.username}`
      );
    } catch (err: unknown) {
      // Revertir si falla
      setUsers(previousUsers);
      setError(err instanceof Error ? err.message : "Error al eliminar el usuario");
      console.error("Error deleting user", err);
    }
  };

  const fetchDeliveryStats = useCallback(async (dateStr?: string) => {
    try {
      return await deliveryStats.getDeliveryStats(dateStr);
    } catch (err) {
      console.error("Error fetching delivery stats", err);
      return [];
    }
  }, [deliveryStats]);

  const addExtraDay = useCallback(async (userId: string, date: string, notes?: string) => {
    try {
      await schedule.addExtraDay(userId, date, notes);
      // Refetch to get updated extraDays
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("Error adding extra day", err);
      throw err;
    }
  }, [fetchUsers, schedule]);

  const removeExtraDay = useCallback(async (userId: string, date: string) => {
    try {
      await schedule.removeExtraDay(userId, date);
      // Refetch to get updated extraDays
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("Error removing extra day", err);
      throw err;
    }
  }, [fetchUsers, schedule]);

  return {
    users,
    loading,
    error,
    saveUser,
    toggleUserStatus,
    deleteUser,
    unlockUser,
    fetchDeliveryStats,
    addExtraDay,
    removeExtraDay,
    refreshUsers: fetchUsers
  };
}
