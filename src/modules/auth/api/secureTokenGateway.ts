import {
  accessTokenStore,
  type AccessTokenStore,
} from "../../../shared/api/accessTokenStore";

interface AuthRuntime {
  authAPI?: {
    setToken(token: string, apiUrl: string): void;
    clearToken(): void;
  };
}

export interface SecureTokenGateway {
  store(token: string): void;
  clear(): void;
}

export function createSecureTokenGateway(
  runtime: AuthRuntime = window,
  apiUrl: string = import.meta.env.VITE_API_BASE_URL || "",
  tokenStore: AccessTokenStore = accessTokenStore,
): SecureTokenGateway {
  return {
    store(token) {
      tokenStore.set(token);
      runtime.authAPI?.setToken(token, apiUrl);
    },

    clear() {
      tokenStore.clear();
      runtime.authAPI?.clearToken();
    },
  };
}

export const secureTokenGateway =
  createSecureTokenGateway();
