import type {
  IAuthService,
  AuthLoginResult,
} from "../model/auth-service.types";
import { ApiClientError, apiClient } from "../../../shared/api";
import type { UserRole } from "../model/user.types";

interface AuthResponse {
  success?: boolean;
  username: string;
  role: UserRole;
  email?: string;
  firstName: string;
  lastName: string;
  access_token: string;
  themePreference: string;
}

interface MessageResponse {
  message?: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export const authService: IAuthService = {
  login: async (identifier, password): Promise<AuthLoginResult> => {
    try {
      const result: AuthResponse | null = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      
      if (!result || result.success === false) {
        return { success: false };
      }
      
      return { 
        success: true, 
        username: result.username,
        role: result.role, 
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        access_token: result.access_token,
        themePreference: result.themePreference
      };
    } catch (error: unknown) {
      console.error("Login fallido:", error);
      const msg = getErrorMessage(error, "");
      const isThrottled = msg.toLowerCase().includes("too many requests") || msg.toLowerCase().includes("throttler");
      return {
        success: false,
        errorMessage: isThrottled
          ? "Demasiados intentos de acceso. Por favor espera un minuto antes de reintentar."
          : (msg && !msg.includes("401") ? msg : undefined),
      };
    }
  },

  loginWithPin: async (pin) => {
    try {
      const result: AuthResponse = await apiClient("/auth/pin", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      
      return { ...result, success: true };
    } catch (error: unknown) {
      console.error("Login con PIN fallido:", error);
      return {
        success: false,
        retryAfterSeconds:
          error instanceof ApiClientError
            ? error.retryAfterSeconds
            : undefined,
        errorMessage: getErrorMessage(
          error,
          "No fue posible validar el PIN.",
        ),
      };
    }
  },

  requestPasswordReset: async (identifier: string) => {
    try {
      const result: MessageResponse = await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: identifier }),
      });
      return { success: true, message: result?.message };
    } catch (error: unknown) {
      console.error("Error solicitando recuperación de contraseña:", error);
      return {
        success: false,
        message: getErrorMessage(error, "Error desconocido"),
      };
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const result: MessageResponse = await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      return { success: true, message: result?.message };
    } catch (error: unknown) {
      console.error("Error restableciendo contraseña:", error);
      return {
        success: false,
        message: getErrorMessage(error, "Enlace inválido o expirado."),
      };
    }
  },

  logout: async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5_000);
    try {
      const result: MessageResponse = await apiClient("/auth/logout", {
        method: "POST",
        signal: controller.signal,
      });
      return { success: true, message: result?.message };
    } catch (error: unknown) {
      return {
        success: false,
        message: getErrorMessage(error, "No fue posible cerrar la sesión."),
      };
    } finally {
      window.clearTimeout(timeout);
    }
  },

  logoutAllDevices: async () => {
    try {
      const result: MessageResponse = await apiClient("/auth/logout-all", {
        method: "POST",
      });
      return { success: true, message: result?.message };
    } catch (error: unknown) {
      console.error("Error cerrando sesión en todos los dispositivos:", error);
      return {
        success: false,
        message: getErrorMessage(error, "Error al cerrar sesiones."),
      };
    }
  },
};
