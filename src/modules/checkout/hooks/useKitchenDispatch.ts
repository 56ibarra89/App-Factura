import { useCallback, useState } from "react";
import type { OrderItem } from "../../orders";
import { logService } from "../../audit";
import type { RunExclusiveAction } from "./useExclusiveAction";

interface UseKitchenDispatchOptions {
  tableId: string | null;
  activeOrderId?: string;
  cart: OrderItem[];
  username: string;
  role: string | null;
  saveTableOrder(orderId?: string, tableId?: string): Promise<unknown>;
  markAsSentToKitchenByTable(tableId: string): void;
  setCart(items: OrderItem[]): void;
  runExclusive: RunExclusiveAction;
}

export function useKitchenDispatch({
  tableId,
  activeOrderId,
  cart,
  username,
  role,
  saveTableOrder,
  markAsSentToKitchenByTable,
  setCart,
  runExclusive,
}: UseKitchenDispatchOptions) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const requestDispatch = useCallback(() => {
    if (tableId) {
      setIsConfirmOpen(true);
    }
  }, [tableId]);

  const cancelDispatch = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const closeSuccess = useCallback(() => {
    setIsSuccessOpen(false);
  }, []);

  const confirmDispatch = useCallback(async () => {
    if (!tableId) return;

    await runExclusive(async () => {
      await saveTableOrder(activeOrderId, tableId);
      markAsSentToKitchenByTable(tableId);

      const sentAt = Date.now();
      setCart(
        cart.map((item) => ({
          ...item,
          isSentToKitchen: true,
          sentAt: item.isSentToKitchen ? item.sentAt : sentAt,
          kitchenStatus: item.isSentToKitchen
            ? item.kitchenStatus
            : "pending",
        })),
      );

      logService.log(
        username,
        role,
        "KITCHEN_DISPATCH",
        `Pedido enviado a cocina para Mesa ${tableId.split("-M")[1]}`,
      );

      setIsSuccessOpen(true);
      setIsConfirmOpen(false);
    });
  }, [
    activeOrderId,
    cart,
    markAsSentToKitchenByTable,
    role,
    runExclusive,
    saveTableOrder,
    setCart,
    tableId,
    username,
  ]);

  return {
    isConfirmOpen,
    isSuccessOpen,
    requestDispatch,
    cancelDispatch,
    closeSuccess,
    confirmDispatch,
  };
}
