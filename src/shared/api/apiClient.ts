import { sessionStore } from "../storage/storage";
import { accessTokenStore } from "./accessTokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
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
      if (window.location.hash !== "#/") {
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

  // Si es un 204 No Content, no intentamos parsear JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
