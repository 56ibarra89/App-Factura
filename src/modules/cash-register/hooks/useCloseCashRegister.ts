import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { useGeneralSettings } from "../../settings";
import {
  shiftRepository as defaultShiftRepository,
  type IShiftRepository,
} from "../api/shiftRepository";
import { useCaja } from "../model/CajaContext";
import type {
  CashDenominationCount,
  Shift,
  ShiftClosePreview,
  ShiftSales,
} from "../model/cash-register.types";
import {
  receiptPrinter,
  type ReceiptPrinter,
} from "../../../shared/printing";

const EMPTY_SALES: ShiftSales = { cash: 0, card: 0, app: 0, total: 0 };

export function useCloseCashRegister(
  printer: ReceiptPrinter = receiptPrinter,
  repository: IShiftRepository = defaultShiftRepository,
) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentShift, cerrarCaja } = useCaja();
  const { config } = useGeneralSettings();
  const [amount, setAmountState] = useState("");
  const [loading, setLoading] = useState(false);
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [error, setError] = useState("");
  const [printShift, setPrintShift] = useState<Shift | null>(null);
  const [preview, setPreview] = useState<ShiftClosePreview | null>(null);
  const [blockersOpen, setBlockersOpen] = useState(false);
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [authorizationPin, setAuthorizationPin] = useState("");
  const [denominationBreakdown, setDenominationBreakdown] = useState<
    CashDenominationCount[] | undefined
  >();

  const refreshPreview = useCallback(async (countedCash?: number) => {
    if (!currentShift?.id) return null;
    setPreflightLoading(true);
    try {
      const result = await repository.getClosePreview(
        currentShift.id,
        countedCash,
      );
      setPreview(result);
      setBlockersOpen(!result.canClose);
      return result;
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No fue posible validar el turno antes del cierre.",
      );
      return null;
    } finally {
      setPreflightLoading(false);
    }
  }, [currentShift?.id, repository]);

  useEffect(() => {
    void refreshPreview();
  }, [refreshPreview]);

  const needsBlindConfirmation =
    preview?.financialsRevealed === false;
  const showReconciliation = preview?.financialsRevealed === true;
  const sales = preview?.sales ?? EMPTY_SALES;
  const totalExpenses = preview?.totalExpenses ?? 0;
  const currentShiftExpenses = preview?.expenses ?? [];
  const expectedCash = preview?.expectedCash ?? 0;
  const discrepancyThreshold =
    preview?.discrepancyThreshold ?? config.cashDiscrepancyThreshold;
  const difference = amount === "" ? 0 : Number(amount) - expectedCash;
  const requiresAuthorization =
    showReconciliation &&
    amount !== "" &&
    Math.abs(difference) > discrepancyThreshold;
  const validAmount =
    amount.trim() !== "" && Number.isFinite(Number(amount)) && Number(amount) >= 0;
  const validAuthorization =
    !requiresAuthorization ||
    (discrepancyReason.trim().length >= 3 && /^\d{4,12}$/.test(authorizationPin));
  const canSubmit =
    validAmount &&
    Boolean(preview?.canClose) &&
    validAuthorization &&
    !loading &&
    !preflightLoading;

  const setAmount = (value: string) => {
    setAmountState(value);
    setDenominationBreakdown(undefined);
  };

  const applyDenominationBreakdown = (
    entries: CashDenominationCount[],
    total: number,
  ) => {
    setDenominationBreakdown(entries);
    setAmountState(total.toFixed(2));
  };

  const closeShift = async () => {
    const latestPreview = await refreshPreview(Number(amount));
    if (!latestPreview?.canClose) return;

    if (latestPreview.expectedCash === undefined) {
      throw new Error("El servidor no devolvió el arqueo final del turno.");
    }

    const finalRequiresAuthorization =
      Math.abs(Number(amount) - latestPreview.expectedCash) >
      latestPreview.discrepancyThreshold;
    if (
      finalRequiresAuthorization &&
      (discrepancyReason.trim().length < 3 ||
        !/^\d{4,12}$/.test(authorizationPin))
    ) {
      throw new Error(
        "El total cambió y ahora requiere justificación y PIN de autorización.",
      );
    }

    const closedShift = await cerrarCaja({
      closingAmount: Number(amount),
      discrepancyReason: finalRequiresAuthorization
        ? discrepancyReason.trim()
        : undefined,
      authorizationPin: finalRequiresAuthorization
        ? authorizationPin
        : undefined,
      denominationBreakdown,
    });
    setPrintShift(closedShift);

    if (config.autoPrintReceipt) {
      try {
        await printer.print({ renderDelayMs: 500, settleDelayMs: 1000 });
      } catch (printError: unknown) {
        console.error("La caja cerró, pero no se pudo imprimir el arqueo:", printError);
      }
    }

    const logoutResult = await logout();
    navigate(logoutResult.success ? "/" : "/home", { replace: true });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (needsBlindConfirmation) {
        const latestPreview = await refreshPreview(Number(amount));
        if (!latestPreview?.canClose || !latestPreview.financialsRevealed) return;
        return;
      }
      await closeShift();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Error al cerrar la caja. Por favor, intenta de nuevo.",
      );
      await refreshPreview();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/home");
  const handleReviewOrders = () => navigate("/ordenes");

  return {
    amount,
    setAmount,
    applyDenominationBreakdown,
    denominationBreakdown,
    loading,
    preflightLoading,
    error,
    sales,
    totalExpenses,
    currentShiftExpenses,
    expectedCash,
    discrepancyThreshold,
    difference,
    requiresAuthorization,
    discrepancyReason,
    setDiscrepancyReason,
    authorizationPin,
    setAuthorizationPin,
    canSubmit,
    currentShift,
    printShift,
    preview,
    blockersOpen,
    setBlockersOpen,
    showReconciliation,
    primaryLabel:
      preview === null
        ? "Validando turno..."
        : needsBlindConfirmation
          ? "Confirmar conteo físico"
          : "Cerrar caja",
    handleSubmit,
    handleCancel,
    handleReviewOrders,
    refreshPreview,
  };
}
