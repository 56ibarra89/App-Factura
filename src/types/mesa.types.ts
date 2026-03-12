export type MesaEstado = "disponible" | "reservado" | "ocupado";

export interface Mesa {
  id: string;
  floor: number;
  estado: MesaEstado;
}
