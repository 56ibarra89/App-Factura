import { useMemo } from "react";
import type { MutableRefObject } from "react";
import type { OrderPreferencesGateway } from "../../services/order/orderPreferencesGateway";
import type {
  OrderCreationGateway,
  OrderFinalizationGateway,
  OrderItemsGateway,
  OrderStatusGateway,
  OrderTablesGateway,
} from "../../services/order/ordersGateway";
import type { OrderCommands } from "../../types/order-context";
import type { Order } from "../../types/order.types";
import { useOrderCollectionCommands } from "./commands/useOrderCollectionCommands";
import { useOrderContentCommands } from "./commands/useOrderContentCommands";
import { useOrderFinalizationCommand } from "./commands/useOrderFinalizationCommand";
import { useOrderStatusCommands } from "./commands/useOrderStatusCommands";
import { useOrderTableCommands } from "./commands/useOrderTableCommands";
import type { OrderStateUpdater } from "./useOrderStore";

interface UseOrderCommandHandlersOptions {
  username: string | null;
  ordersRef: MutableRefObject<Order[]>;
  updateOrders(updater: OrderStateUpdater): void;
  creationGateway: OrderCreationGateway;
  statusGateway: OrderStatusGateway;
  itemsGateway: OrderItemsGateway;
  finalizationGateway: OrderFinalizationGateway;
  tablesGateway: OrderTablesGateway;
  preferencesGateway: OrderPreferencesGateway;
}

export function useOrderCommandHandlers({
  username,
  ordersRef,
  updateOrders,
  creationGateway,
  statusGateway,
  itemsGateway,
  finalizationGateway,
  tablesGateway,
  preferencesGateway,
}: UseOrderCommandHandlersOptions): OrderCommands {
  const collection = useOrderCollectionCommands({
    username,
    ordersRef,
    updateOrders,
    gateway: creationGateway,
    preferencesGateway,
  });
  const status = useOrderStatusCommands({
    updateOrders,
    statusGateway,
    itemsGateway,
  });
  const content = useOrderContentCommands({
    ordersRef,
    updateOrders,
    gateway: itemsGateway,
  });
  const finalization = useOrderFinalizationCommand({
    ordersRef,
    updateOrders,
    itemsGateway,
    finalizationGateway,
  });
  const tables = useOrderTableCommands({
    username,
    updateOrders,
    creationGateway,
    tablesGateway,
  });
  const {
    addOrder,
    removeOrder,
    clearHistory,
  } = collection;
  const {
    updateOrderStatus,
    markAsSentToKitchen,
    markAsSentToKitchenByTable,
  } = status;
  const { updateOrderItems } = content;
  const { finalizeOrder } = finalization;
  const { moveOrder, unirMesas } = tables;

  return useMemo(
    () => ({
      addOrder,
      updateOrderStatus,
      removeOrder,
      clearHistory,
      updateOrderItems,
      finalizeOrder,
      markAsSentToKitchen,
      markAsSentToKitchenByTable,
      moveOrder,
      unirMesas,
    }),
    [
      addOrder,
      clearHistory,
      finalizeOrder,
      markAsSentToKitchen,
      markAsSentToKitchenByTable,
      moveOrder,
      removeOrder,
      unirMesas,
      updateOrderItems,
      updateOrderStatus,
    ],
  );
}
