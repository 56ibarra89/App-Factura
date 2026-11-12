import { useState, useCallback } from "react";
import type { TableSelectMode } from "../model/table.types";

export function useMesaDialogs(restoreFocus: () => void) {
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isTableSelectOpen, setIsTableSelectOpen] = useState(false);
  const [tableSelectMode, setTableSelectMode] = useState<TableSelectMode | null>(null);

  const openReservation = useCallback(() => setIsReservationOpen(true), []);
  const closeReservation = useCallback(() => {
    setIsReservationOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  const openTableSelect = useCallback((mode: TableSelectMode) => {
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
    setIsReservationOpen,
  };
}

