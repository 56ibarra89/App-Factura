import { Order } from "./order.types";
import { Shift } from "./shift.types";
import { SystemLog, LogLevel } from "../services/logService";

/**
 * DIP: Abstracción para la persistencia de órdenes.
 * Los contextos dependen de esta interfaz, no de IndexedDB directamente.
 */
export interface IOrderRepository {
  save(order: Order): Promise<void>;
  getByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
}

/**
 * DIP: Abstracción para la persistencia de turnos (cajas).
 */
export interface IShiftRepository {
  save(shift: Shift): Promise<void>;
  getAll(): Promise<Shift[]>;
}

/**
 * DIP: Abstracción para la bitácora de auditoría.
 */
export interface ILogRepository {
  add(
    user: string,
    role: string | null,
    action: string,
    details?: string,
    level?: LogLevel
  ): Promise<void>;
  getRecent(limit?: number): Promise<SystemLog[]>;
}
