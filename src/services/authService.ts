import { IAuthService, AuthLoginResult } from "../types/authService";
import { apiClient } from "../config/apiClient";

export const authService: IAuthService = {
  login: async (identifier, password): Promise<AuthLoginResult> => {
    try {
      const result = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      
      return { 
        success: true, 
        role: result.role, 
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName
      };
    } catch (error) {
      console.error("Login fallido:", error);
      return { success: false };
    }
  },

  loginWithPin: async (pin) => {
    try {
      const result = await apiClient("/auth/pin", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      
      return result;
    } catch (error) {
      console.error("Login con PIN fallido:", error);
      return null;
    }
  },
};
