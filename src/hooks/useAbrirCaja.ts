import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../context/CajaContext";
import { useGeneralConfigData } from "./useGeneralConfigData";
import { shiftRepository } from "../repositories/ShiftRepository";
import { useCajasConfig } from "./useCajasConfig";
import { useAuth } from "../context/AuthContext";
import { useAccountManager } from "./useAccountManager";

export function useAbrirCaja() {
  const navigate = useNavigate();
  const { abrirCaja } = useCaja();
  const { config } = useGeneralConfigData();
  const { cajas } = useCajasConfig();
  const { username, role } = useAuth();
  const { users } = useAccountManager();
  
  const [selectedRegisterId, setSelectedRegisterId] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);

  // Determinar qué cajas están disponibles para este usuario
  const currentUser = users.find(u => u.username === username);
  const currentUserId = currentUser?.id;
  
  const availableCajas = cajas.filter(c => {
    if (role === 'admin') return true; // Admins ven todas
    
    // Si la caja no tiene array de asignados, revisamos el fallback (assignedUserId)
    const assignedIds = c.assignedUserIds || ((c as any).assignedUserId ? [(c as any).assignedUserId] : []);
    
    if (assignedIds.length === 0) return true; // Las sin asignar son públicas
    return currentUserId ? assignedIds.includes(currentUserId) : false; // Las asignadas son exclusivas
  });

  useEffect(() => {
    let isMounted = true;
    shiftRepository.getAll().then((shifts) => {
      if (!isMounted) return;
      if (shifts.length > 0) {
        // As shiftRepository.getAll() returns shifts sorted by descending startTime
        const lastShift = shifts[0];
        if (lastShift.status === "closed" && lastShift.closingAmount !== undefined) {
          setExpectedAmount(lastShift.closingAmount);
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Precompletar monto según la caja seleccionada
  useEffect(() => {
    if (selectedRegisterId) {
      const reg = availableCajas.find((c) => c.id === selectedRegisterId);
      if (reg) {
        if (config.requireExactOpeningAmount && expectedAmount !== null) {
          setAmount(String(expectedAmount));
        } else {
          setAmount(String(reg.defaultOpeningAmount));
        }
      }
    }
  }, [selectedRegisterId, availableCajas, config.requireExactOpeningAmount, expectedAmount]);

  const numAmount = Number(amount);
  
  const canSubmit = (() => {
    // Es obligatorio seleccionar una estación de caja si existen estaciones configuradas
    if (availableCajas.length > 0 && !selectedRegisterId) return false;
    if (amount === "" || numAmount < 0) return false;
    
    // Si la configuración exige monto exacto y tenemos un turno anterior válido
    if (config.requireExactOpeningAmount && expectedAmount !== null) {
      return numAmount === expectedAmount;
    }
    
    return numAmount >= 0;
  })();

  const handleSubmit = async () => {
    const selectedRegister = availableCajas.find((c) => c.id === selectedRegisterId);
    const registerName = selectedRegister ? selectedRegister.name : undefined;

    console.log("[useAbrirCaja] Ejecutando handleSubmit con monto y caja:", amount, registerName);
    try {
      await abrirCaja(Number(amount), registerName);
      console.log("[useAbrirCaja] Navegando a /home...");
      navigate("/home");
    } catch (error) {
      console.error("Failed to open shift:", error);
      // Podría mostrar un toast acá si lo hubiera
    }
  };

  const handleCancel = () => {
    navigate("/home");
  };

  return {
    cajas: availableCajas,
    selectedRegisterId,
    setSelectedRegisterId,
    amount,
    setAmount,
    canSubmit,
    expectedAmount,
    requireExactOpening: config.requireExactOpeningAmount,
    handleSubmit,
    handleCancel,
  };
}
