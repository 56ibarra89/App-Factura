import { useUserDirectoryStore } from "../model/UserDirectoryContext";

export function useUserDirectory() {
  const {
    users,
    loading,
    error,
    refreshUsers,
  } = useUserDirectoryStore();

  return {
    users,
    loading,
    error,
    refreshUsers,
  };
}
