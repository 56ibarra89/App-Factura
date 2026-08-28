import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../model/CajaContext";
import { useGeneralSettings } from "../../settings";
import { shiftRepository } from "../api/shiftRepository";
import { useAuth } from "../../auth";

export function useOpenCashRegister() {
  const navigate = useNavigate();
  const { abrirCaja, currentShift } = useCaja();
  const { config } = useGeneralSettings();
  const { username, role } = useAuth();

  const getDefaultRegisterName = () => {
    switch (role) {
      case "cajero_principal":
        return "Caja Principal";
      case "despachador":
        return "Despacho Delivery";
      case "admin":
        return "Caja Principal";
      default:
        return "Caja Mostrador";
    }
  };

  const [cashRegisterName, setCashRegisterName] = useState(getDefaultRegisterName);
  const [amount, setAmount] = useState("");
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    shiftRepository.getAll().then((shifts) => {
      if (!isMounted) return;
      if (shifts.length > 0) {
        const lastShift = shifts[0];
        if (lastShift.status === "closed" && lastShift.closingAmount !== undefined) {
          setExpectedAmount(lastShift.closingAmount);
          if (config.requireExactOpeningAmount) {
            setAmount(String(lastShift.closingAmount));
          }
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [config.requireExactOpeningAmount]);

  const numAmount = Number(amount);

  const canSubmit = (() => {
    if (Boolean(currentShift) || isSubmitting) return false;
    if (amount === "" || !Number.isFinite(numAmount) || numAmount < 0) return false;

    if (config.requireExactOpeningAmount && expectedAmount !== null) {
      return numAmount === expectedAmount;
    }

    return numAmount >= 0;
  })();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const registerName = cashRegisterName.trim() || getDefaultRegisterName();

    setIsSubmitting(true);
    setError("");
    try {
      await abrirCaja(Number(amount), registerName);
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
    cashRegisterName,
    setCashRegisterName,
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
