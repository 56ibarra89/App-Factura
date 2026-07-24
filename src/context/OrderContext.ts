import { createContext, useContext } from "react";
import type {
  OrderCommands,
  OrderContextValue,
  OrderQueries,
} from "../types/order-context";

export const OrderQueriesContext = createContext<
  OrderQueries | undefined
>(undefined);
export const OrderCommandsContext = createContext<
  OrderCommands | undefined
>(undefined);

export function useOrderQueries(): OrderQueries {
  const context = useContext(OrderQueriesContext);
  if (!context) {
    throw new Error(
      "useOrderQueries debe usarse dentro de <OrderProvider>",
    );
  }
  return context;
}

export function useOrderCommands(): OrderCommands {
  const context = useContext(OrderCommandsContext);
  if (!context) {
    throw new Error(
      "useOrderCommands debe usarse dentro de <OrderProvider>",
    );
  }
  return context;
}

export function useOrderContext(): OrderContextValue {
  const queries = useContext(OrderQueriesContext);
  const commands = useContext(OrderCommandsContext);
  if (!queries || !commands) {
    throw new Error(
      "useOrderContext debe usarse dentro de <OrderProvider>",
    );
  }
  return { ...queries, ...commands };
}
