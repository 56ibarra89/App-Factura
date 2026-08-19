import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../model/CajaContext";
import { useGeneralSettings } from "../../settings";
import { shiftRepository } from "../api/shiftRepository";
import { useCashRegisterConfig } from "./useCashRegisterConfig";
import { useAuth } from "../../auth";
import { useUserDirectory } from "../../accounts";

export function useOpenCashRegister() {
  const navigate = useNavigate();
  const { abrirCaja, currentShift } = useCaja();
  const { config } = useGeneralSettings();
  const { cajas } = useCashRegisterConfig();
  const { username, role } = useAuth();
  const { users } = useUserDirectory();

  const [selectedRegisterId, setSelectedRegisterId] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentUser = users.find(u => u.username === username);
  const currentUserId = currentUser?.id;

  const availableCajas = useMemo(
    () =>
      cajas.filter((cashRegister) => {
        if (role === "admin") return true;

        const assignedIds =
          cashRegister.assignedUserIds ||
          (cashRegister.assignedUserId
            ? [cashRegister.assignedUserId]
            : []);

        if (assignedIds.length === 0) return true;
        return currentUserId
          ? assignedIds.includes(currentUserId)
          : false;
      }),
    [cajas, currentUserId, role],
  );

  useEffect(() => {
    if (availableCajas.length === 1 && !selectedRegisterId) {
      setSelectedRegisterId(availableCajas[0].id);
      return;
    }

    if (
      selectedRegisterId &&
      !availableCajas.some((cashRegister) => cashRegister.id === selectedRegisterId)
    ) {
      setSelectedRegisterId("");
    }
  }, [availableCajas, selectedRegisterId]);

  useEffect(() => {
    let isMounted = true;
    shiftRepository.getAll().then((shifts) => {
      if (!isMounted) return;
      if (shifts.length > 0) {

        const lastShift = shifts[0];
        if (lastShift.status === "closed" && lastShift.closingAmount !== undefined) {
          setExpectedAmount(lastShift.closingAmount);
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

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
    if (currentShift || isSubmitting) return false;

    if (availableCajas.length > 0 && !selectedRegisterId) return false;
    if (amount === "" || !Number.isFinite(numAmount) || numAmount < 0) return false;

    if (config.requireExactOpeningAmount && expectedAmount !== null) {
      return numAmount === expectedAmount;
    }

    return numAmount >= 0;
  })();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const selectedRegister = availableCajas.find((c) => c.id === selectedRegisterId);
    const registerName = selectedRegister ? selectedRegister.name : undefined;

    console.log("[useAbrirCaja] Ejecutando handleSubmit con monto y caja:", amount, registerName);
    setIsSubmitting(true);
    setError("");
    try {
      await abrirCaja(Number(amount), registerName);
      console.log("[useAbrirCaja] Navegando a /home...");
      navigate("/home");
    } catch (cause) {
      console.error("Failed to open shift:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible registrar la apertura de caja.",
      );
    } finally {
      setIsSubmitting(false);
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
    isSubmitting,
    error,
    handleSubmit,
    handleCancel,
  };
}

