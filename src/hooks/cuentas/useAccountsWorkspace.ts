import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserAccount } from "../../types/user";
import { useAccountManager } from "../useAccountManager";

export function useAccountsWorkspace() {
  const {
    users,
    error,
    saveUser,
    toggleUserStatus,
    deleteUser,
    unlockUser,
  } = useAccountManager();
  const [selectedUserId, setSelectedUserId] = useState<
    string | null
  >(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ||
    null;
  const userToDelete =
    users.find((user) => user.id === pendingDeleteId) ||
    null;

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query),
    );
  }, [searchQuery, users]);

  const createUser = useCallback(() => {
    setSelectedUserId(null);
    setTabIndex(0);
  }, []);

  const selectUser = useCallback((id: string) => {
    setSelectedUserId(id);
    setTabIndex(0);
  }, []);

  const requestDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId) {
      void deleteUser(pendingDeleteId);
      setSelectedUserId(null);
      setTabIndex(0);
    }
    setPendingDeleteId(null);
  }, [deleteUser, pendingDeleteId]);

  const handleSave = useCallback(
    async (user: UserAccount) => {
      const isEditing = !!user.id;
      const saved = await saveUser(user);
      if (!saved) return;

      setSuccessMessage(
        `Usuario ${
          isEditing ? "actualizado" : "creado"
        } con éxito`,
      );
      setSelectedUserId(saved.id);
    },
    [saveUser],
  );

  const handleUnlock = useCallback(
    async (id: string) => {
      try {
        await unlockUser(id);
        setSuccessMessage(
          "Usuario desbloqueado exitosamente",
        );
      } catch {
        setErrorMessage(
          "Error al desbloquear el usuario",
        );
      }
    },
    [unlockUser],
  );

  return {
    users,
    filteredUsers,
    selectedUser,
    selectedUserId,
    searchQuery,
    setSearchQuery,
    tabIndex,
    setTabIndex,
    createUser,
    selectUser,
    saveUser: handleSave,
    toggleUserStatus,
    unlockUser: handleUnlock,
    requestDelete,
    deletion: {
      open: !!pendingDeleteId,
      user: userToDelete,
      confirm: confirmDelete,
      cancel: cancelDelete,
    },
    feedback: {
      error: errorMessage,
      success: successMessage,
      closeError: () => setErrorMessage(null),
      closeSuccess: () => setSuccessMessage(null),
    },
  };
}
