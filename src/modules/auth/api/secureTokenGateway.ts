import {
  accessTokenStore,
  type AccessTokenStore,
} from "../../../shared/api";

interface AuthRuntime {
  authAPI?: {
    setToken(token: string): Promise<boolean>;
    clearToken(): Promise<void>;
  };
}

export interface SecureTokenGateway {
  store(token: string, refreshToken?: string): Promise<void>;
  clear(): Promise<void>;
}

export function createSecureTokenGateway(
  runtime: AuthRuntime = window,
  tokenStore: AccessTokenStore = accessTokenStore,
): SecureTokenGateway {
  return {
    async store(token, refreshToken) {
      if (typeof refreshToken === "string" && refreshToken) {
        tokenStore.setRefreshToken?.(refreshToken);
      }
      if (runtime.authAPI) {
        tokenStore.clear();
        if (typeof refreshToken === "string" && refreshToken) {
          tokenStore.setRefreshToken?.(refreshToken);
        }
        const stored = await runtime.authAPI.setToken(token);
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
