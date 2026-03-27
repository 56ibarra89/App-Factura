import { IAuthService } from "../types/authService";

export const authService: IAuthService = {
  login: async (username, password) => {
    const allowedUsers = new Set(["admin", "fran", "engels", "sidney"]);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(allowedUsers.has(username) && password === "123456");
      }, 1000);
    });
  },

  loginWithPin: async (pin) => {
    const pinDictionary: Record<string, string> = {
      "1234": "admin",
      "4321": "fran",
      "0000": "engels",
      "1111": "sidney",
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(pinDictionary[pin] || null);
      }, 1000);
    });
  },
};

// Deprecated: use authService
/** @deprecated use authService.login */
export const fakeAuth = authService.login;
/** @deprecated use authService.loginWithPin */
export const fakePinAuth = authService.loginWithPin;
