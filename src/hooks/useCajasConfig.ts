import { useState, useEffect, useCallback } from "react";
import { CashRegisterConfig, ShiftProfileConfig, CashRegisterType } from "../types/shift.types";
import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../services/config/runtimeConfigGateway";

const CAJAS_KEY = "app_factura_cajas_config";
const TURNOS_KEY = "app_factura_turnos_config";

const DEFAULT_CAJAS: CashRegisterConfig[] = [];
const DEFAULT_TURNOS: ShiftProfileConfig[] = [];

// Caches globales
let globalCajasCache: CashRegisterConfig[] | null = null;
let globalTurnosCache: ShiftProfileConfig[] | null = null;
const cajasListeners = new Set<(cajas: CashRegisterConfig[]) => void>();
const turnosListeners = new Set<(turnos: ShiftProfileConfig[]) => void>();

export function useCajasConfig(
  gateway: RuntimeConfigGateway = runtimeConfigGateway,
) {
  const [cajas, setCajasState] = useState<CashRegisterConfig[]>(globalCajasCache || DEFAULT_CAJAS);
  const [turnos, setTurnosState] = useState<ShiftProfileConfig[]>(globalTurnosCache || DEFAULT_TURNOS);

  // Cargar datos del backend
  useEffect(() => {
    const cajaListener = (newCajas: CashRegisterConfig[]) => setCajasState(newCajas);
    const turnoListener = (newTurnos: ShiftProfileConfig[]) => setTurnosState(newTurnos);
    
    cajasListeners.add(cajaListener);
    turnosListeners.add(turnoListener);

    if (!globalCajasCache) {
      gateway.get<CashRegisterConfig[]>(CAJAS_KEY).then(res => {
        const loaded = Array.isArray(res) && res.length > 0 ? res : DEFAULT_CAJAS;
        globalCajasCache = loaded;
        cajasListeners.forEach(l => l(loaded));
      }).catch(err => console.error("Error cargando cajas:", err));
    }

    if (!globalTurnosCache) {
      gateway.get<ShiftProfileConfig[]>(TURNOS_KEY).then(res => {
        const loaded = Array.isArray(res) && res.length > 0 ? res : DEFAULT_TURNOS;
        globalTurnosCache = loaded;
        turnosListeners.forEach(l => l(loaded));
      }).catch(err => console.error("Error cargando turnos:", err));
    }

    return () => {
      cajasListeners.delete(cajaListener);
      turnosListeners.delete(turnoListener);
    };
  }, [gateway]);

  // CRUD Cajas
  const saveCajas = useCallback((newCajas: CashRegisterConfig[]) => {
    globalCajasCache = newCajas;
    cajasListeners.forEach(l => l(newCajas));
    
    gateway
      .save(CAJAS_KEY, newCajas)
      .catch(err => console.error("Error guardando cajas:", err));
  }, [gateway]);

  const addCaja = useCallback((name: string, defaultOpeningAmount: number, type?: CashRegisterType, assignedUserIds?: string[], assignedUserNames?: string[]) => {
    const newCaja: CashRegisterConfig = {
      id: `C-${Date.now()}`,
      name,
      defaultOpeningAmount,
      type,
      assignedUserIds,
      assignedUserNames,
    };
    saveCajas([...cajas, newCaja]);
  }, [cajas, saveCajas]);

  const updateCaja = useCallback((id: string, name: string, defaultOpeningAmount: number, type?: CashRegisterType, assignedUserIds?: string[], assignedUserNames?: string[]) => {
    const updated = cajas.map(c => c.id === id ? { ...c, name, defaultOpeningAmount, type, assignedUserIds, assignedUserNames } : c);
    saveCajas(updated);
  }, [cajas, saveCajas]);

  const deleteCaja = useCallback((id: string) => {
    const updated = cajas.filter(c => c.id !== id);
    saveCajas(updated);
  }, [cajas, saveCajas]);

  // CRUD Turnos
  const saveTurnos = useCallback((newTurnos: ShiftProfileConfig[]) => {
    globalTurnosCache = newTurnos;
    turnosListeners.forEach(l => l(newTurnos));

    gateway
      .save(TURNOS_KEY, newTurnos)
      .catch(err => console.error("Error guardando turnos:", err));
  }, [gateway]);

  const addTurno = useCallback((name: string, startTime: string, endTime: string, description?: string, assignedRole?: string, assignedUserIds?: string[], assignedUserNames?: string[], daysOfWeek?: number[]) => {
    const newTurno: ShiftProfileConfig = {
      id: `T-${Date.now()}`,
      name,
      startTime,
      endTime,
      description,
      assignedRole,
      assignedUserIds,
      assignedUserNames,
      daysOfWeek,
    };
    saveTurnos([...turnos, newTurno]);
  }, [turnos, saveTurnos]);

  const updateTurno = useCallback((id: string, name: string, startTime: string, endTime: string, description?: string, assignedRole?: string, assignedUserIds?: string[], assignedUserNames?: string[], daysOfWeek?: number[]) => {
    const updated = turnos.map(t => t.id === id ? { ...t, name, startTime, endTime, description, assignedRole, assignedUserIds, assignedUserNames, daysOfWeek } : t);
    saveTurnos(updated);
  }, [turnos, saveTurnos]);

  const deleteTurno = useCallback((id: string) => {
    const updated = turnos.filter(t => t.id !== id);
    saveTurnos(updated);
  }, [turnos, saveTurnos]);

  return {
    cajas,
    turnos,
    addCaja,
    updateCaja,
    deleteCaja,
    addTurno,
    updateTurno,
    deleteTurno,
  };
}
