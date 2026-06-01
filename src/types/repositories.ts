import { Shift } from "./shift.types";
import type { SystemLog, LogLevel } from "./log.types";
import type { Customer } from "./customer.types";
import type { Correlativo } from "./correlativo.types";

/**
 * DIP: Abstracción para la persistencia de turnos (cajas).
 */
export interface IShiftRepository {
  openShift(data: any): Promise<Shift>;
  closeShift(id: string, data: any): Promise<Shift>;
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

/** DIP: Abstracción para persistencia/consulta de clientes. */
export interface ICustomerRepository {
  searchByName(query: string): Promise<Customer[]>;
  upsertCustomer(
    name: string,
    address?: string,
    phone?: string
  ): Promise<{ customer: Customer; isNew: boolean }>;
  getAll(): Promise<Customer[]>;
  update(customer: Customer): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Customer | null>;
}

/** DIP: Abstracción para persistencia/consulta de correlativos. */
export interface ICorrelativoRepository {
  save(correlativo: Correlativo): Promise<void>;
  update(id: string, correlativo: Partial<Correlativo>): Promise<void>;
  getAll(): Promise<Correlativo[]>;
  getActiveByDocumentType(documentType: string): Promise<Correlativo | null>;
  delete(id: string): Promise<void>;
}
