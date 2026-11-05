import { localStore } from "../storage/storage";

export interface AccessTokenStore {
  get(): string | null;
  set(token: string): void;
  getRefreshToken?(): string | null;
  setRefreshToken?(token: string | null): void;
  clear(): void;
}

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;

// Remove tokens persisted by versions prior to the secure in-memory/Electron store.
localStore.removeItem("access_token");
localStore.removeItem("refresh_token");

export const accessTokenStore: AccessTokenStore = {
  get() {
    return currentAccessToken;
  },

  set(token) {
    currentAccessToken = token;
  },

  getRefreshToken() {
    return currentRefreshToken;
  },

  setRefreshToken(token) {
    currentRefreshToken = token;
  },

  clear() {
    currentAccessToken = null;
    currentRefreshToken = null;
  },
};

export function hasAccessToken(): boolean {
  return accessTokenStore.get() !== null;
}

export function isJwtTokenExpiringSoon(
  token: string | null | undefined,
  thresholdMs = 60_000,
  nowMs = Date.now(),
): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const normalizedBase64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const jsonPayload = atob(normalizedBase64);
    const parsed = JSON.parse(jsonPayload) as { exp?: unknown };
    if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) {
      return false;
    }
    return parsed.exp * 1000 - nowMs <= thresholdMs;
  } catch {
    return false;
  }
}
