import { IAuthService, AuthLoginResult } from "../types/authService";
import { apiClient } from "../config/apiClient";
import type { UserRole } from "../types/user";

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
    } catch (error) {
      console.error("Login fallido:", error);
      return { success: false };
    }
  },

  loginWithPin: async (pin) => {
    try {
      const result: AuthResponse = await apiClient("/auth/pin", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      
      return result;
    } catch (error) {
      console.error("Login con PIN fallido:", error);
      return null;
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
