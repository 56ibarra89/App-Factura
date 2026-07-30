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
  apiUrl: string =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3000",
): SecureTokenGateway {
  return {
    store(token) {
      runtime.authAPI?.setToken(token, apiUrl);
    },

    clear() {
      runtime.authAPI?.clearToken();
    },
  };
}

export const secureTokenGateway =
  createSecureTokenGateway();
