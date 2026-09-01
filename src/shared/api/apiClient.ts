import { localStore, sessionStore } from "../storage/storage";
import { accessTokenStore } from "./accessTokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  "access_token",
] as const;

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

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      accessTokenStore.clear();
      if (window.authAPI) {
        window.authAPI.clearToken();
      }
      sessionStore.clear();
      AUTH_KEYS.forEach((key) => localStore.removeItem(key));

      if (window.location.hash !== "#/" && window.location.hash !== "") {
        window.location.hash = "#/";
      }
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    let errorMessage = "Ocurrió un error en la petición al servidor";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  const responseBody = await response.text();
  if (!responseBody.trim()) {
    return null;
  }

  return JSON.parse(responseBody);
};
