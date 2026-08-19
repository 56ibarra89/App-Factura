import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCaja } from "../model/CajaContext";
import { useGeneralSettings } from "../../settings";
import type { Shift } from "../model/cash-register.types";
import {
  receiptPrinter,
  type ReceiptPrinter,
} from "../../../shared/printing";

export function useCloseCashRegister(
  printer: ReceiptPrinter = receiptPrinter,
) {
  const navigate = useNavigate();
  const { currentShift, cerrarCaja, calculateCurrentShiftSales } = useCaja();
  const { config } = useGeneralSettings();
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

      const finalSales = calculateCurrentShiftSales();
      const finalShift = {
        ...currentShift!,
        endTime: new Date(),
        closingAmount: Number(amount),
        totalSales: finalSales,
      };

      if (config.autoPrintReceipt) {
        setPrintShift(finalShift);
        await printer.print({
          renderDelayMs: 500,
          settleDelayMs: 1000,
        });
        await cerrarCaja(Number(amount));
        navigate("/home");
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

