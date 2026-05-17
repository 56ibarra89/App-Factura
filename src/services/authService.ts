import { IAuthService, AuthLoginResult } from "../types/authService";
import { UserRole } from "../types/user";

const USER_TABLE: Record<string, { password: string; role: UserRole; email?: string }> = {
  admin: {
    password: import.meta.env.VITE_USER_ADMIN_PASS,
    role: import.meta.env.VITE_USER_ADMIN_ROLE as UserRole,
    email: import.meta.env.VITE_USER_ADMIN_EMAIL,
  },
  fran: {
    password: import.meta.env.VITE_USER_FRAN_PASS,
    role: import.meta.env.VITE_USER_FRAN_ROLE as UserRole,
  },
  engels: {
    password: import.meta.env.VITE_USER_ENGELS_PASS,
    role: import.meta.env.VITE_USER_ENGELS_ROLE as UserRole,
  },
  sidney: {
    password: import.meta.env.VITE_USER_SIDNEY_PASS,
    role: import.meta.env.VITE_USER_SIDNEY_ROLE as UserRole,
  },
};

/**
 * Tabla de PINs de acceso rápido
 */
const PIN_TABLE: Record<string, { username: string; role: UserRole }> = {
  [import.meta.env.VITE_PIN_ADMIN]: { username: "admin", role: "admin" },
  [import.meta.env.VITE_PIN_FRAN]: { username: "fran", role: "cajero" },
  [import.meta.env.VITE_PIN_ENGELS]: { username: "engels", role: "mesero" },
  [import.meta.env.VITE_PIN_SIDNEY]: { username: "sidney", role: "cocinero" },
};

export const authService: IAuthService = {
  login: async (identifier, password): Promise<AuthLoginResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idLower = identifier.toLowerCase();
        
        // Buscamos primero por nombre de usuario, si no existe, buscamos por email
        const entry = USER_TABLE[idLower] || Object.values(USER_TABLE).find(
          (u) => u.email && u.email.toLowerCase() === idLower
        );

        if (entry && entry.password === password) {
          resolve({ success: true, role: entry.role, email: entry.email });
        } else {
          resolve({ success: false });
        }
      }, 800);
    });
  },

  loginWithPin: async (pin) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(PIN_TABLE[pin] ?? null);
      }, 800);
    });
  },
};
