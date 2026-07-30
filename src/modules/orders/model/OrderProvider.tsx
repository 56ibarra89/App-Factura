import {
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../auth";
import type {
  OrderQueries,
} from "./order-context.types";
import { orderSelectors } from "./orderDomain";
import {
  ordersGateway as defaultOrdersGateway,
  type CurrentOrdersGateway,
  type OrderCreationGateway,
  type OrderFinalizationGateway,
  type OrderItemsGateway,
  type OrderStatusGateway,
  type OrderTablesGateway,
} from "../api/ordersGateway";
import {
  orderPreferencesGateway as defaultPreferencesGateway,
  type OrderPreferencesGateway,
} from "../api/orderPreferencesGateway";
import { useOrderStore } from "../hooks/useOrderStore";
import { useOrderSynchronization } from "../hooks/useOrderSynchronization";
import { useOrderCommandHandlers } from "../hooks/useOrderCommandHandlers";
import {
  OrderCommandsContext,
  OrderQueriesContext,
} from "./OrderContext";

export interface OrderProviderGateways {
  currentOrders: CurrentOrdersGateway;
  creation: OrderCreationGateway;
  status: OrderStatusGateway;
  items: OrderItemsGateway;
  finalization: OrderFinalizationGateway;
  tables: OrderTablesGateway;
}

interface OrderProviderProps {
  children: ReactNode;
  gateways?: Partial<OrderProviderGateways>;
  preferencesGateway?: OrderPreferencesGateway;
  pollIntervalMs?: number;
}

export function OrderProvider({
  children,
  gateways = {},
  preferencesGateway = defaultPreferencesGateway,
  pollIntervalMs,
}: OrderProviderProps) {
  const { username, isLoggedIn } = useAuth();
  const { orders, ordersRef, updateOrders } = useOrderStore();
  const {
    currentOrders = defaultOrdersGateway,
    creation = defaultOrdersGateway,
    status = defaultOrdersGateway,
    items = defaultOrdersGateway,
    finalization = defaultOrdersGateway,
    tables = defaultOrdersGateway,
  } = gateways;

  useOrderSynchronization({
    isLoggedIn,
    ordersRef,
    updateOrders,
    gateway: currentOrders,
    preferencesGateway,
    pollIntervalMs,
  });

  const commands = useOrderCommandHandlers({
    username,
    ordersRef,
    updateOrders,
    creationGateway: creation,
    statusGateway: status,
    itemsGateway: items,
    finalizationGateway: finalization,
    tablesGateway: tables,
    preferencesGateway,
  });

  const getOrderByTable = useCallback<OrderQueries["getOrderByTable"]>(
    (tableId) => orderSelectors.getActiveOrderByTable(orders, tableId),
    [orders],
  );

  const queries = useMemo<OrderQueries>(
    () => ({ orders, getOrderByTable }),
    [getOrderByTable, orders],
  );

  return (
    <OrderQueriesContext.Provider value={queries}>
      <OrderCommandsContext.Provider value={commands}>
        {children}
      </OrderCommandsContext.Provider>
    </OrderQueriesContext.Provider>
  );
}
