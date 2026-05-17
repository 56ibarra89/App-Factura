import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../context/CajaContext";
import { useGeneralConfigData } from "./useGeneralConfigData";
import { shiftRepository } from "../repositories/ShiftRepository";

export function useAbrirCaja() {
  const navigate = useNavigate();
  const { abrirCaja } = useCaja();
  const { config } = useGeneralConfigData();
  const [amount, setAmount] = useState("");
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);

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

  const numAmount = Number(amount);
  
  const canSubmit = (() => {
    if (amount === "" || numAmount < 0) return false;
    
    // Si la configuración exige monto exacto y tenemos un turno anterior válido
    if (config.requireExactOpeningAmount && expectedAmount !== null) {
      return numAmount === expectedAmount;
    }
    
    // Si no exige monto exacto o no hay turno anterior, cualquier monto >= 0 es válido
    // (el usuario prefirió permitir montos mayores o iguales a 0)
    return numAmount >= 0;
  })();

  const handleSubmit = () => {
    console.log("[useAbrirCaja] Ejecutando handleSubmit con monto:", amount);
    abrirCaja(Number(amount));
    console.log("[useAbrirCaja] Navegando a /home...");
    navigate("/home");
  };

  const handleCancel = () => {
    navigate("/home");
  };

  return {
    amount,
    setAmount,
    canSubmit,
    expectedAmount,
    requireExactOpening: config.requireExactOpeningAmount,
    handleSubmit,
    handleCancel,
  };
}
