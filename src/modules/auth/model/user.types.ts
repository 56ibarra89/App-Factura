export type UserRole = "admin" | "cajero" | "mesero" | "cocinero" | "motorizado" | "despachador";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  cajero: "Cajero",
  mesero: "Mesero",
  cocinero: "Cocinero",
  motorizado: "Motorizado",
  despachador: "Despachador",
};
