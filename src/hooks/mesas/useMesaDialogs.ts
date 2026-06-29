import { useState, useCallback } from "react";

export function useMesaDialogs(restoreFocus: () => void) {
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isTableSelectOpen, setIsTableSelectOpen] = useState(false);
  const [tableSelectMode, setTableSelectMode] = useState<"unir" | "mover" | null>(null);

  const openReservation = useCallback(() => setIsReservationOpen(true), []);
  const closeReservation = useCallback(() => {
    setIsReservationOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  const openTableSelect = useCallback((mode: "unir" | "mover") => {
    setTableSelectMode(mode);
    setIsTableSelectOpen(true);
  }, []);

  const closeTableSelect = useCallback(() => {
    setIsTableSelectOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  return {
    isReservationOpen,
    openReservation,
    closeReservation,
    isTableSelectOpen,
    tableSelectMode,
    openTableSelect,
    closeTableSelect,
    setIsReservationOpen, // For cases where we just want to set it without restoreFocus
  };
}
