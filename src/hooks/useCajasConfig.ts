import { useState, useEffect, useCallback } from "react";
import { localStore, setJson, tryGetJson } from "../services/storage/storage";
import { CashRegisterConfig, ShiftProfileConfig } from "../types/shift.types";

const CAJAS_KEY = "app_factura_cajas_config";
const TURNOS_KEY = "app_factura_turnos_config";

const DEFAULT_CAJAS: CashRegisterConfig[] = [
  { id: "C-01", name: "Caja Principal", defaultOpeningAmount: 200.0 },
  { id: "C-02", name: "Caja Barra", defaultOpeningAmount: 100.0 },
  { id: "C-03", name: "Caja Drive-Thru", defaultOpeningAmount: 150.0 },
];

const DEFAULT_TURNOS: ShiftProfileConfig[] = [
  { id: "T-01", name: "Matutino", startTime: "08:00", endTime: "16:00", description: "Turno de mañana" },
  { id: "T-02", name: "Vespertino", startTime: "16:00", endTime: "00:00", description: "Turno de tarde/noche" },
  { id: "T-03", name: "Nocturno", startTime: "00:00", endTime: "08:00", description: "Turno de madrugada" },
];

export function useCajasConfig() {
  const [cajas, setCajas] = useState<CashRegisterConfig[]>([]);
  const [turnos, setTurnos] = useState<ShiftProfileConfig[]>([]);

  // Cargar datos
  useEffect(() => {
    const savedCajas = tryGetJson<CashRegisterConfig[]>(localStore, CAJAS_KEY);
    if (savedCajas) {
      setCajas(savedCajas);
    } else {
      setCajas(DEFAULT_CAJAS);
      setJson(localStore, CAJAS_KEY, DEFAULT_CAJAS);
    }

    const savedTurnos = tryGetJson<ShiftProfileConfig[]>(localStore, TURNOS_KEY);
    if (savedTurnos) {
      setTurnos(savedTurnos);
    } else {
      setTurnos(DEFAULT_TURNOS);
      setJson(localStore, TURNOS_KEY, DEFAULT_TURNOS);
    }
  }, []);

  // CRUD Cajas
  const saveCajas = useCallback((newCajas: CashRegisterConfig[]) => {
    setCajas(newCajas);
    setJson(localStore, CAJAS_KEY, newCajas);
  }, []);

  const addCaja = useCallback((name: string, defaultOpeningAmount: number) => {
    const newCaja: CashRegisterConfig = {
      id: `C-${Date.now()}`,
      name,
      defaultOpeningAmount,
    };
    saveCajas([...cajas, newCaja]);
  }, [cajas, saveCajas]);

  const updateCaja = useCallback((id: string, name: string, defaultOpeningAmount: number) => {
    const updated = cajas.map(c => c.id === id ? { ...c, name, defaultOpeningAmount } : c);
    saveCajas(updated);
  }, [cajas, saveCajas]);

  const deleteCaja = useCallback((id: string) => {
    const updated = cajas.filter(c => c.id !== id);
    saveCajas(updated);
  }, [cajas, saveCajas]);

  // CRUD Turnos
  const saveTurnos = useCallback((newTurnos: ShiftProfileConfig[]) => {
    setTurnos(newTurnos);
    setJson(localStore, TURNOS_KEY, newTurnos);
  }, []);

  const addTurno = useCallback((name: string, startTime: string, endTime: string, description?: string) => {
    const newTurno: ShiftProfileConfig = {
      id: `T-${Date.now()}`,
      name,
      startTime,
      endTime,
      description,
    };
    saveTurnos([...turnos, newTurno]);
  }, [turnos, saveTurnos]);

  const updateTurno = useCallback((id: string, name: string, startTime: string, endTime: string, description?: string) => {
    const updated = turnos.map(t => t.id === id ? { ...t, name, startTime, endTime, description } : t);
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
