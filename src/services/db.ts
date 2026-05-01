/**
 * SRP: db.ts ahora es una fachada delgada que re-exporta desde los repositorios.
 * Mantiene compatibilidad total con cualquier import existente en el proyecto.
 * La lógica real vive en src/repositories/.
 */

// Re-exportar initDB desde la configuración centralizada
export { initDB } from "../repositories/db.config";

// Re-exportar operaciones de órdenes
import { orderRepository } from "../repositories/OrderRepository";
import { Order } from "../types/order.types";

export const saveOrderDB = (order: Order) => orderRepository.save(order);
export const getOrdersByDateRange = (startDate: Date, endDate: Date) =>
  orderRepository.getByDateRange(startDate, endDate);
export const getOrderById = (id: string) => orderRepository.getById(id);

// Re-exportar operaciones de turnos
import { shiftRepository } from "../repositories/ShiftRepository";
import { Shift } from "../types/shift.types";

export const saveShiftDB = (shift: Shift) => shiftRepository.save(shift);
export const getAllShiftsDB = () => shiftRepository.getAll();
