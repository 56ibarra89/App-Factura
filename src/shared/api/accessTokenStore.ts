import { localStore } from "../storage/storage";

export interface AccessTokenStore {
  get(): string | null;
  set(token: string): void;
  clear(): void;
}

let currentAccessToken: string | null = null;

// Remove tokens persisted by versions prior to the secure in-memory/Electron store.
localStore.removeItem("access_token");

export const accessTokenStore: AccessTokenStore = {
  get() {
    return currentAccessToken;
  },

  set(token) {
    currentAccessToken = token;
  },

  clear() {
    currentAccessToken = null;
  },
};

export function hasAccessToken(): boolean {
  return accessTokenStore.get() !== null;
}
