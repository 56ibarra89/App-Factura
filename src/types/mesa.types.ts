export type MesaEstado = "disponible" | "reservado" | "ocupado";

export interface FloorConfig {
  id: number;
  name: string;
  tableCount: number;
}

export interface Mesa {
  id: string;
  floor: number;
  estado: MesaEstado;
  reservationName?: string;
}

export interface ReservationInfo {
  nombre: string;
  monto: number;
  reservationTime?: string;
  expirationTime?: string;
}

export interface TableOption {
  id: string;
  label: string;
}

export type TableSelectMode = "unir" | "mover";
