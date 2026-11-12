import { localStore, sessionStore } from "../storage/storage";
import {
  accessTokenStore,
  isJwtTokenExpiringSoon,
} from "./accessTokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;

export type ResponseValidator<T> = (data: unknown) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiRequestOptions<T = any> extends RequestInit {
  timeoutMs?: number;
  /**
   * Cuando es true, la respuesta exitosa actualiza la marca de actividad humana.
   * Por defecto es false para evitar que sondeos o tráfico de fondo reinicien el temporizador de inactividad.
   */
  trackUserActivity?: boolean;
  /**
   * Validador opcional de contrato en ejecución para garantizar la forma de la respuesta HTTP.
   */
  validateResponse?: ResponseValidator<T>;
}

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
      "Asegúrate de crear el archivo .env en la raíz del proyecto con: VITE_API_BASE_URL=http://localhost:3000",
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
  "accessRoleId",
  "accessRoleName",
  "permissions",
] as const;

let isHandlingUnauthorized = false;
let unauthorizedTimeout: ReturnType<typeof setTimeout> | null = null;
let refreshPromise: Promise<string | null> | null = null;
let refreshSession = -1;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;

  const forwardAbort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) {
    forwardAbort();
  } else {
    options.signal?.addEventListener("abort", forwardAbort, { once: true });
  }

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error: unknown) {
    if (timedOut) {
      throw new ApiClientError(
        "El servidor tardó demasiado en responder. Intenta nuevamente.",
        408,
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", forwardAbort);
  }
}

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

export async function attemptTokenRefresh(): Promise<string | null> {
  const session = accessTokenStore.getSessionRevision();
  if (refreshPromise && refreshSession === session) {
    return refreshPromise;
  }

  refreshSession = session;
  refreshPromise = (async () => {
    try {
      const baseUrl = API_BASE_URL || "";
      const url = `${baseUrl}/auth/refresh`;
      const currentRefreshToken =
        accessTokenStore.getRefreshToken?.() ?? null;
      const currentAccessToken = accessTokenStore.get();
      const revision = accessTokenStore.getRevision();
      const bearerToken = currentRefreshToken || currentAccessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      };

      const response = await fetchWithTimeout(url, {
        method: "POST",
        cache: "no-store",
        headers,
        body: JSON.stringify(
          currentRefreshToken ? { refresh_token: currentRefreshToken } : {},
        ),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newToken = data?.access_token;
      const newRefreshToken = data?.refresh_token;
      if (accessTokenStore.getRevision() !== revision) return null;
      if (typeof newToken === "string" && newToken) {
        accessTokenStore.rotate(newToken);
        if (typeof newRefreshToken === "string" && newRefreshToken) {
          accessTokenStore.setRefreshToken?.(newRefreshToken);
        }
        const committedRevision = accessTokenStore.getRevision();
        if (window.authAPI) {
          await window.authAPI.setToken(newToken);
        }
        if (accessTokenStore.getRevision() !== committedRevision) return null;
        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      if (refreshSession === session) refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiClient = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions<T> = {},
): Promise<T> => {
  const baseUrl = API_BASE_URL || "";
  const url = `${baseUrl}${endpoint}`;
  const {
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    trackUserActivity = false,
    validateResponse,
    ...requestOptions
  } = options;
  const hasMultipartBody = requestOptions.body instanceof FormData;
  let accessToken = accessTokenStore.get();
  const requestSession = accessTokenStore.getSessionRevision();

  if (
    !isAuthEndpoint(endpoint) &&
    accessToken &&
    isJwtTokenExpiringSoon(accessToken)
  ) {
    const proactivelyRefreshed = await attemptTokenRefresh();
    if (proactivelyRefreshed) {
      accessToken = proactivelyRefreshed;
    } else if (accessTokenStore.getSessionRevision() !== requestSession) {
      throw new Error('La sesión cambió durante la petición.');
    }
  }

  const headers: Record<string, string> = {
    ...(hasMultipartBody ? {} : { "Content-Type": "application/json" }),
    "X-Audit-Source": "INTERFACE",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(requestOptions.headers as Record<string, string>),
  };

  let response = await fetchWithTimeout(
    url,
    {
      cache: "no-store",
      ...requestOptions,
      headers,
    },
    timeoutMs,
  );

  if (!response.ok) {
    if (response.status === 401 && !isAuthEndpoint(endpoint)) {
      if (accessTokenStore.getSessionRevision() !== requestSession) {
        throw new Error('La sesión cambió durante la petición.');
      }
      // Intentar renovación silenciosa antes de dar por expirada la sesión
      const refreshedToken = accessTokenStore.get() !== accessToken
        ? accessTokenStore.get()
        : await attemptTokenRefresh();
      if (accessTokenStore.getSessionRevision() !== requestSession) {
        throw new Error('La sesión cambió durante la petición.');
      }
      if (refreshedToken) {
        const retryHeaders: Record<string, string> = {
          ...headers,
          Authorization: `Bearer ${refreshedToken}`,
        };
        response = await fetchWithTimeout(
          url,
          {
            cache: "no-store",
            ...requestOptions,
            headers: retryHeaders,
          },
          timeoutMs,
        );
      }

      if (!response.ok && response.status === 401) {
        if (accessTokenStore.getSessionRevision() !== requestSession) {
          throw new Error('La sesión cambió durante la petición.');
        }
        handleUnauthorizedSession();
        throw new Error(
          "Sesión expirada. Por favor, inicia sesión nuevamente.",
        );
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

  if (trackUserActivity) {
    localStore.setItem("lastActivity", Date.now().toString());
  }

  if (response.status === 204) {
    return (validateResponse ? validateResponse(null) : null) as T;
  }

  const responseBody = await response.text();
  if (!responseBody.trim()) {
    return (validateResponse ? validateResponse(null) : null) as T;
  }

  const parsed: unknown = JSON.parse(responseBody);
  return (validateResponse ? validateResponse(parsed) : parsed) as T;
};
