export interface DeliveryStat {
  userId: string;
  todayDeliveries: number;
}

export interface DeliveryDriver {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  workDays?: string[];
  extraDays?: Array<{
    date: string;
    notes?: string;
  }>;
}

export interface DeliveryZone {
  id: string;
  name: string; // ej: "Zona 1 - Casco Urbano"
  price: number; // Tarifa cobrada al cliente (ej: 30)
  driverPayout: number; // Monto asignado al motorizado por entrega (ej: 25 o 30)
  neighborhoods?: string[]; // Colonias o barrios sugeridos
  isActive: boolean;
}

export interface DeliveryRulesConfig {
  freeDeliveryEnabled: boolean;
  freeDeliveryMinAmount: number; // ej: 600
  zones: DeliveryZone[];
}
