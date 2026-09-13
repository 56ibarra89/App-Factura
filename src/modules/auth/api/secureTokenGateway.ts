import {
  accessTokenStore,
  type AccessTokenStore,
} from "../../../shared/api/accessTokenStore";

interface AuthRuntime {
  authAPI?: {
    setToken(token: string, apiUrl: string): Promise<boolean>;
    clearToken(): Promise<void>;
  };
}

export interface SecureTokenGateway {
  store(token: string): Promise<void>;
  clear(): Promise<void>;
}

export function createSecureTokenGateway(
  runtime: AuthRuntime = window,
  apiUrl: string = import.meta.env.VITE_API_BASE_URL || "",
  tokenStore: AccessTokenStore = accessTokenStore,
): SecureTokenGateway {
  return {
    async store(token) {
      if (runtime.authAPI) {
        tokenStore.clear();
        const stored = await runtime.authAPI.setToken(token, apiUrl);
        if (!stored) throw new Error("No fue posible proteger la sesión.");
        return;
      }
      tokenStore.set(token);
    },

    async clear() {
      tokenStore.clear();
      await runtime.authAPI?.clearToken();
    },
  };
}

export const secureTokenGateway =
  createSecureTokenGateway();
