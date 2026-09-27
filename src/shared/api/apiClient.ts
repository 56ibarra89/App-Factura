import { localStore, sessionStore } from "../storage/storage";
import { accessTokenStore } from "./accessTokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

if (!API_BASE_URL) {
  console.error(
    "⚠️ [API Client] La variable de entorno VITE_API_BASE_URL no está definida en el archivo .env. " +
    "Asegúrate de crear el archivo .env en la raíz del proyecto con: VITE_API_BASE_URL=http://localhost:3000"
  );
}

const AUTH_KEYS = [
  "loggedIn",
  "username",
  "role",
  "email",
  "firstName",
  "lastName",
  "lastActivity",
] as const;

let isHandlingUnauthorized = false;
let unauthorizedTimeout: ReturnType<typeof setTimeout> | null = null;
let refreshPromise: Promise<string | null> | null = null;

function handleUnauthorizedSession() {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  accessTokenStore.clear();
  if (window.authAPI) {
    void window.authAPI.clearToken();
  }
  sessionStore.clear();
  AUTH_KEYS.forEach((key) => localStore.removeItem(key));

  // Emitir evento desacoplado para que React Router y los hooks sincronicen
  window.dispatchEvent(new CustomEvent("appfactura:session-expired"));

  if (window.location.hash !== "#/" && window.location.hash !== "") {
    window.location.hash = "#/";
  }

  if (unauthorizedTimeout) clearTimeout(unauthorizedTimeout);
  unauthorizedTimeout = setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 2000);
}

function isAuthEndpoint(endpoint: string): boolean {
  return (
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/pin") ||
    endpoint.includes("/auth/refresh") ||
    endpoint.includes("/auth/forgot-password") ||
    endpoint.includes("/auth/reset-password") ||
    endpoint.includes("/users/login") ||
    endpoint.includes("/users/login-pin")
  );
}

async function attemptTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = API_BASE_URL || "";
      const url = `${baseUrl}/auth/refresh`;
      const currentToken = accessTokenStore.get();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      };

      const response = await fetch(url, {
        method: "POST",
        cache: "no-store",
        headers,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newToken = data?.access_token;
      if (typeof newToken === "string" && newToken) {
        accessTokenStore.set(newToken);
        if (window.authAPI) {
          await window.authAPI.setToken(newToken, baseUrl);
        }
        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = API_BASE_URL || "";
  const url = `${baseUrl}${endpoint}`;
  const hasMultipartBody = options.body instanceof FormData;
  const accessToken = accessTokenStore.get();
  
  const headers: Record<string, string> = {
    ...(hasMultipartBody ? {} : { "Content-Type": "application/json" }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  let response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && !isAuthEndpoint(endpoint)) {
      // Intentar renovación silenciosa antes de dar por expirada la sesión
      const refreshedToken = await attemptTokenRefresh();
      if (refreshedToken) {
        const retryHeaders: Record<string, string> = {
          ...headers,
          Authorization: `Bearer ${refreshedToken}`,
        };
        response = await fetch(url, {
          cache: "no-store",
          ...options,
          headers: retryHeaders,
        });
      }

      if (!response.ok && response.status === 401) {
        handleUnauthorizedSession();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }
    }

    if (!response.ok) {
      let errorMessage = "Ocurrió un error en la petición al servidor";
      let retryAfterSeconds: number | undefined;
      try {
        const errorData = await response.json();
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else if (typeof errorData.message === "string") {
          errorMessage = errorData.message;
        }
        if (
          typeof errorData.retryAfterSeconds === "number" &&
          Number.isFinite(errorData.retryAfterSeconds)
        ) {
          retryAfterSeconds = Math.max(
            1,
            Math.ceil(errorData.retryAfterSeconds),
          );
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiClientError(
        errorMessage,
        response.status,
        retryAfterSeconds,
      );
    }
  }

  // Actualizar marca de actividad en almacenamiento local
  localStore.setItem("lastActivity", Date.now().toString());

  if (response.status === 204) {
    return null;
  }

  const responseBody = await response.text();
  if (!responseBody.trim()) {
    return null;
  }

  return JSON.parse(responseBody);
};
