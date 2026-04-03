import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../context/CajaContext";

export function useCerrarCaja() {
  const navigate = useNavigate();
  const { currentShift, cerrarCaja, calculateCurrentShiftSales } = useCaja();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sales = useMemo(() => calculateCurrentShiftSales(), [calculateCurrentShiftSales]);

  const canSubmit = Number(amount) >= 0 && amount !== "" && !loading;
  
  const expectedCash = currentShift ? currentShift.openingAmount + sales.cash : 0;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await cerrarCaja(Number(amount));
      navigate("/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al cerrar la caja. Por favor, intenta de nuevo.");
      }
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/home");

  return {
    amount,
    setAmount,
    loading,
    error,
    sales,
    expectedCash,
    canSubmit,
    currentShift,
    handleSubmit,
    handleCancel,
  };
}
