export type UserRole =
  | "admin"
  | "cajero"
  | "cajero_principal"
  | "mesero"
  | "cocinero"
  | "motorizado"
  | "despachador";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  cajero: "Cajero",
  cajero_principal: "Cajero Principal",
  mesero: "Mesero",
  cocinero: "Cocinero",
  motorizado: "Motorizado",
  despachador: "Despachador",
};
