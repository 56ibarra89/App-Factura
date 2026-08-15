export interface AccessTokenStore {
  get(): string | null;
  set(token: string): void;
  clear(): void;
}

let currentAccessToken: string | null = null;

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
