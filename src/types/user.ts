export type UserRole = "admin" | "cajero" | "mesero" | "cocinero";

export interface UserAccount {
  id: string; // Puede ser el nombre de usuario para simplificar (debe ser único)
  username: string; // El nombre con el que inicia sesión
  firstName: string;
  lastName: string;
  pin: string;
  password?: string; // En un escenario real no se expondría fácilmente, pero para manejo local simulado
  role: UserRole;
  isActive: boolean; // Para suspender la cuenta sin borrarla
  createdAt: string; // ISO string
  lastVisit?: string; // ISO string
}

export const ROLE_COLORS: Record<UserRole, "error" | "success" | "info" | "warning"> = {
  admin: "error",     // Rojo - Alto privilegio
  cajero: "success",  // Verde - Finanzas
  mesero: "info",     // Azul - Atención
  cocinero: "warning" // Naranja - Cocina
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  cajero: "Cajero",
  mesero: "Mesero",
  cocinero: "Cocinero"
};
