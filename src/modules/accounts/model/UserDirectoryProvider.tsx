import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../auth";
import {
  usersGateway,
  type UserDirectoryGateway,
} from "../api/usersGateway";
import type { UserAccount } from "./account.types";
import {
  UserDirectoryContext,
  type UserDirectoryUpdater,
} from "./UserDirectoryContext";

interface UserDirectoryProviderProps {
  children: ReactNode;
  gateway?: UserDirectoryGateway;
}

export function UserDirectoryProvider({
  children,
  gateway = usersGateway,
}: UserDirectoryProviderProps) {
  const { isLoggedIn, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(
        await (hasPermission("users.read") || !gateway.listDirectory
          ? gateway.list()
          : gateway.listDirectory()),
      );
    } catch (cause: unknown) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Error al cargar los usuarios";
      setError(message);
      console.error(cause);
    } finally {
      setLoading(false);
    }
  }, [gateway, hasPermission]);

  useEffect(() => {
    if (!isLoggedIn || !hasPermission("users.directory")) {
      setUsers([]);
      setError(null);
      setLoading(false);
      return;
    }
    void refreshUsers();
  }, [hasPermission, isLoggedIn, refreshUsers]);

  const updateUsers = useCallback(
    (updater: UserDirectoryUpdater) => {
      setUsers((current) => updater(current));
    },
    [],
  );

  const value = useMemo(
    () => ({
      users,
      loading,
      error,
      refreshUsers,
      updateUsers,
    }),
    [error, loading, refreshUsers, updateUsers, users],
  );

  return (
    <UserDirectoryContext.Provider value={value}>
      {children}
    </UserDirectoryContext.Provider>
  );
}
