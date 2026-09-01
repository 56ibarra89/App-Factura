import { localStore } from "../storage/storage";

export interface AccessTokenStore {
  get(): string | null;
  set(token: string): void;
  clear(): void;
}

const ACCESS_TOKEN_KEY = "access_token";
let currentAccessToken: string | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
      currentAccessToken = localStore.getItem(ACCESS_TOKEN_KEY);
    }
  });
}

export const accessTokenStore: AccessTokenStore = {
  get() {
    if (currentAccessToken) return currentAccessToken;
    const stored = localStore.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      currentAccessToken = stored;
      return stored;
    }
    return null;
  },

  set(token) {
    currentAccessToken = token;
    localStore.setItem(ACCESS_TOKEN_KEY, token);
  },

  clear() {
    currentAccessToken = null;
    localStore.removeItem(ACCESS_TOKEN_KEY);
  },
};

export function hasAccessToken(): boolean {
  return accessTokenStore.get() !== null;
}
