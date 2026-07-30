import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../../../shared/api";
import type {
  CashRegisterConfig,
  CashRegisterConfigState,
  ShiftProfileConfig,
} from "../model/cash-register.types";

const CASH_REGISTERS_KEY = "app_factura_cajas_config";
const SHIFT_PROFILES_KEY = "app_factura_turnos_config";

export interface CashRegisterConfigGateway {
  load(): Promise<CashRegisterConfigState>;
  saveCashRegisters(cashRegisters: CashRegisterConfig[]): Promise<void>;
  saveShiftProfiles(shiftProfiles: ShiftProfileConfig[]): Promise<void>;
}

export function createCashRegisterConfigGateway(
  runtimeGateway: RuntimeConfigGateway = runtimeConfigGateway,
): CashRegisterConfigGateway {
  return {
    async load() {
      const [cashRegisters, shiftProfiles] = await Promise.all([
        runtimeGateway.get<CashRegisterConfig[]>(CASH_REGISTERS_KEY),
        runtimeGateway.get<ShiftProfileConfig[]>(SHIFT_PROFILES_KEY),
      ]);

      return {
        cashRegisters: Array.isArray(cashRegisters) ? cashRegisters : [],
        shiftProfiles: Array.isArray(shiftProfiles) ? shiftProfiles : [],
      };
    },

    saveCashRegisters: (cashRegisters) =>
      runtimeGateway.save(CASH_REGISTERS_KEY, cashRegisters),

    saveShiftProfiles: (shiftProfiles) =>
      runtimeGateway.save(SHIFT_PROFILES_KEY, shiftProfiles),
  };
}

export const cashRegisterConfigGateway =
  createCashRegisterConfigGateway();
