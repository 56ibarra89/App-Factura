import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../context/CajaContext";
import { useGeneralConfigData } from "./useGeneralConfigData";
import { Shift } from "../types/shift.types";

export function useCerrarCaja() {
  const navigate = useNavigate();
  const { currentShift, cerrarCaja, calculateCurrentShiftSales } = useCaja();
  const { config } = useGeneralConfigData();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [printShift, setPrintShift] = useState<Shift | null>(null);

  const sales = useMemo(() => calculateCurrentShiftSales(), [calculateCurrentShiftSales]);

  const canSubmit = Number(amount) >= 0 && amount !== "" && !loading;
  
  const expectedCash = currentShift ? currentShift.openingAmount + sales.cash : 0;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Calculate sales exactly as they will be saved
      const finalSales = calculateCurrentShiftSales();
      const finalShift = {
        ...currentShift!,
        endTime: new Date(),
        closingAmount: Number(amount),
        totalSales: finalSales,
      };

      if (config.autoPrintReceipt) {
        setPrintShift(finalShift);
        // Wait for state to update and render the ticket component before printing
        setTimeout(() => {
          if (window.ipcRenderer) {
            window.ipcRenderer.send('print-silent');
          }
          
          // Wait a bit more for the print spooler to capture the DOM before unmounting
          setTimeout(async () => {
            await cerrarCaja(Number(amount));
            navigate("/home");
          }, 1000);
        }, 500);
      } else {
        await cerrarCaja(Number(amount));
        navigate("/home");
      }
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
    printShift,
    blindCashCount: config.blindCashCount,
    autoPrintReceipt: config.autoPrintReceipt,
    handleSubmit,
    handleCancel,
  };
}
