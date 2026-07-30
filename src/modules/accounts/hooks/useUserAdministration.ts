import { useCallback, useState } from "react";
import { logService } from "../../audit";
import { useAuth } from "../../auth";
import {
  usersGateway,
  type UserAdministrationGateway,
  type UserMutationPayload,
} from "../api/usersGateway";
import type { UserAccount } from "../model/account.types";
import { useUserDirectoryStore } from "../model/UserDirectoryContext";

export function useUserAdministration(
  gateway: UserAdministrationGateway = usersGateway,
) {
  const { username: adminUser, role: adminRole } = useAuth();
  const { users, updateUsers } = useUserDirectoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveUser = useCallback(
    async (user: UserAccount) => {
      setLoading(true);
      setError(null);
      try {
        const isNew = !user.id;
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
        if (user.password?.trim()) {
          payload.password = user.password;
        }

        const savedUser = isNew
          ? await gateway.create(payload)
          : await gateway.update(user.id, payload);

        updateUsers((current) =>
          isNew
            ? [...current, savedUser]
            : current.map((item) =>
                item.id === savedUser.id ? savedUser : item,
              ),
        );
        logService.log(
          adminUser,
          adminRole,
          isNew ? "USER_CREATE" : "USER_UPDATE",
          isNew
            ? `Nuevo usuario creado: @${savedUser.username} (${savedUser.firstName} ${savedUser.lastName})`
            : `Usuario actualizado: @${savedUser.username} (${savedUser.firstName} ${savedUser.lastName})`,
        );
        return savedUser;
      } catch (cause: unknown) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Error al guardar el usuario";
        setError(message);
        console.error(cause);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [adminRole, adminUser, gateway, updateUsers],
  );

  const toggleUserStatus = useCallback(
    async (userId: string) => {
      const user = users.find((item) => item.id === userId);
      if (!user) return;

      updateUsers((current) =>
        current.map((item) =>
          item.id === userId
            ? { ...item, isActive: !user.isActive }
            : item,
        ),
      );
      try {
        await gateway.update(userId, {
          isActive: !user.isActive,
        });
        logService.log(
          adminUser,
          adminRole,
          "USER_UPDATE_STATUS",
          `Usuario @${user.username} ${
            !user.isActive ? "ACTIVADO" : "DESACTIVADO"
          }`,
        );
      } catch (cause: unknown) {
        updateUsers((current) =>
          current.map((item) =>
            item.id === userId
              ? { ...item, isActive: user.isActive }
              : item,
          ),
        );
        setError(
          cause instanceof Error
            ? cause.message
            : "Error al actualizar el estado del usuario",
        );
        console.error("Error toggling user status", cause);
      }
    },
    [adminRole, adminUser, gateway, updateUsers, users],
  );

  const unlockUser = useCallback(
    async (userId: string) => {
      try {
        await gateway.unlock(userId);
        logService.log(
          adminUser,
          adminRole,
          "USER_UNLOCK",
          `Usuario desbloqueado: ID ${userId}`,
        );
        updateUsers((current) =>
          current.map((item) =>
            item.id === userId
              ? {
                  ...item,
                  lockedUntil: undefined,
                  failedLoginAttempts: 0,
                  lockoutLevel: 0,
                }
              : item,
          ),
        );
      } catch (cause: unknown) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Error al desbloquear el usuario",
        );
        console.error("Error unlocking user", cause);
        throw cause;
      }
    },
    [adminRole, adminUser, gateway, updateUsers],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      const user = users.find((item) => item.id === userId);
      if (!user) return;
      if (user.username === adminUser) {
        setError("No puedes eliminar tu propia cuenta.");
        return;
      }

      const previousUsers = users;
      updateUsers((current) =>
        current.filter((item) => item.id !== userId),
      );
      try {
        await gateway.delete(userId);
        logService.log(
          adminUser,
          adminRole,
          "USER_DELETE",
          `Usuario eliminado permanentemente: @${user.username}`,
        );
      } catch (cause: unknown) {
        updateUsers(() => previousUsers);
        setError(
          cause instanceof Error
            ? cause.message
            : "Error al eliminar el usuario",
        );
        console.error("Error deleting user", cause);
      }
    },
    [
      adminRole,
      adminUser,
      gateway,
      updateUsers,
      users,
    ],
  );

  return {
    loading,
    error,
    saveUser,
    toggleUserStatus,
    deleteUser,
    unlockUser,
  };
}
