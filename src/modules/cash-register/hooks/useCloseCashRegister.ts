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
} from "../model/cash-register.types";
import {
  receiptPrinter,
  type ReceiptPrinter,
} from "../../../shared/printing";

export function useCloseCashRegister(
  printer: ReceiptPrinter = receiptPrinter,
  repository: IShiftRepository = defaultShiftRepository,
) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentShift, cerrarCaja } = useCaja();
  const { config } = useGeneralSettings();
  const [amount, setAmountState] = useState("");
  const [declaredCardAmount, setDeclaredCardAmount] = useState("");
  const [declaredAppAmount, setDeclaredAppAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [preflightLoading, setPreflightLoading] = useState(false);
  const [error, setError] = useState("");
  const [printShift, setPrintShift] = useState<Shift | null>(null);
  const [preview, setPreview] = useState<ShiftClosePreview | null>(null);
  const [blockersOpen, setBlockersOpen] = useState(false);
  const [requiresAuthorization, setRequiresAuthorization] = useState(false);
  const [discrepancyReason, setDiscrepancyReason] = useState("");
  const [authorizationPin, setAuthorizationPin] = useState("");
  const [denominationBreakdown, setDenominationBreakdown] = useState<
    CashDenominationCount[] | undefined
  >();

  const refreshPreview = useCallback(
    async (counted?: { cash?: number; card?: number; app?: number } | number) => {
      if (!currentShift?.id) return null;
      setPreflightLoading(true);
      try {
        const result = await repository.getClosePreview(
          currentShift.id,
          counted,
        );
        setPreview(result);
        setBlockersOpen(!result.canClose);
        if (counted !== undefined) {
          setRequiresAuthorization(result.requiresAuthorization === true);
        }
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
    },
    [currentShift?.id, repository],
  );

  useEffect(() => {
    void refreshPreview();
  }, [refreshPreview]);

  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(Number(amount)) &&
    Number(amount) >= 0 &&
    (declaredCardAmount.trim() === "" ||
      (Number.isFinite(Number(declaredCardAmount)) &&
        Number(declaredCardAmount) >= 0)) &&
    (declaredAppAmount.trim() === "" ||
      (Number.isFinite(Number(declaredAppAmount)) &&
        Number(declaredAppAmount) >= 0));

  const validAuthorization =
    !requiresAuthorization ||
    (discrepancyReason.trim().length >= 5 &&
      /^\d{4,12}$/.test(authorizationPin));
  const canSubmit =
    validAmount &&
    Boolean(preview?.canClose) &&
    validAuthorization &&
    !loading &&
    !preflightLoading;

  const resetAuthorization = () => {
    setRequiresAuthorization(false);
    setDiscrepancyReason("");
    setAuthorizationPin("");
  };

  const setAmount = (value: string) => {
    setAmountState(value);
    setDenominationBreakdown(undefined);
    resetAuthorization();
  };

  const applyDenominationBreakdown = (
    entries: CashDenominationCount[],
    total: number,
  ) => {
    setDenominationBreakdown(entries);
    setAmountState(total.toFixed(2));
    resetAuthorization();
  };

  const completeClose = async (authorizationNeeded: boolean) => {
    const cardNum = Number(declaredCardAmount) || 0;
    const appNum = Number(declaredAppAmount) || 0;

    const closedShift = await cerrarCaja({
      closingAmount: Number(amount) || 0,
      declaredCardAmount: cardNum,
      declaredAppAmount: appNum,
      discrepancyReason: authorizationNeeded
        ? discrepancyReason.trim()
        : undefined,
      authorizationPin: authorizationNeeded ? authorizationPin : undefined,
      denominationBreakdown,
    });
    setPrintShift(closedShift);

    if (config.autoPrintReceipt) {
      try {
        await printer.print({ renderDelayMs: 500, settleDelayMs: 1000 });
      } catch (printError: unknown) {
        console.error(
          "La caja cerró, pero no se pudo imprimir el arqueo:",
          printError,
        );
      }
    }

    const logoutResult = await logout();
    navigate(logoutResult.success ? "/" : "/home", { replace: true });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const latestPreview = await refreshPreview({
        cash: Number(amount) || 0,
        card: Number(declaredCardAmount) || 0,
        app: Number(declaredAppAmount) || 0,
      });
      if (!latestPreview?.canClose) return;

      const authorizationNeeded =
        latestPreview.requiresAuthorization === true;
      setRequiresAuthorization(authorizationNeeded);
      if (
        authorizationNeeded &&
        (discrepancyReason.trim().length < 5 ||
          !/^\d{4,12}$/.test(authorizationPin))
      ) {
        return;
      }

      await completeClose(authorizationNeeded);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Error al cerrar la caja. Por favor, intenta de nuevo.",
      );
      await refreshPreview({
        cash: Number(amount) || 0,
        card: Number(declaredCardAmount) || 0,
        app: Number(declaredAppAmount) || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    amount,
    setAmount,
    declaredCardAmount,
    setDeclaredCardAmount,
    declaredAppAmount,
    setDeclaredAppAmount,
    applyDenominationBreakdown,
    denominationBreakdown,
    loading,
    preflightLoading,
    error,
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
    handleSubmit,
    handleCancel: () => navigate("/home"),
    handleReviewOrders: () => navigate("/ordenes"),
    refreshPreview,
  };
}
