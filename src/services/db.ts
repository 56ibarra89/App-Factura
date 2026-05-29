/**
 * SRP: db.ts es una fachada delgada que re-exporta desde los repositorios.
 * Mantiene compatibilidad con los hooks que la importan (useDailyReport, useOrderHistory, useTurnosHistory).
 * La lógica real vive en src/repositories/.
 */

// Re-exportar operaciones de órdenes (ahora desde backendSync)
import { fetchOrdersByDateRange } from "./order/backendSync";
export const getOrdersByDateRange = (startDate: Date, endDate: Date) =>
  fetchOrdersByDateRange(startDate, endDate);

// Re-exportar operaciones de turnos
import { shiftRepository } from "../repositories/ShiftRepository";
export const getAllShiftsDB = () => shiftRepository.getAll();
