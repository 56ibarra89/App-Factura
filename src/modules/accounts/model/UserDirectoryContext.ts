import { createContext, useContext } from "react";
import type { UserAccount } from "./account.types";

export type UserDirectoryUpdater = (
  current: UserAccount[],
) => UserAccount[];

export interface UserDirectoryStore {
  users: UserAccount[];
  loading: boolean;
  error: string | null;
  refreshUsers(): Promise<void>;
  updateUsers(updater: UserDirectoryUpdater): void;
}

export const UserDirectoryContext = createContext<
  UserDirectoryStore | undefined
>(undefined);

export function useUserDirectoryStore(): UserDirectoryStore {
  const context = useContext(UserDirectoryContext);
  if (!context) {
    throw new Error(
      "useUserDirectory debe usarse dentro de <UserDirectoryProvider>",
    );
  }
  return context;
}
