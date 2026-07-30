import type { UserRole } from "../../auth";

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  pin: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastVisit?: string;
  workDays?: string[];
  extraDays?: { date: string; notes?: string }[];
}

export interface AccountData {
  id?: string;
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  pin: string;
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
  themePreference: "light" | "dark";
}
