import { useCallback } from "react";
import {
  createOrder,
  orderMutations,
} from "../../../services/order/orderDomain";
import type {
  OrderCreationGateway,
  OrderTablesGateway,
} from "../../../services/order/ordersGateway";
import type { OrderCommands } from "../../../types/order-context";
import type { Order } from "../../../types/order.types";
import type { OrderStateUpdater } from "../useOrderStore";

interface UseOrderTableCommandsOptions {
  username: string | null;
  updateOrders(updater: OrderStateUpdater): void;
  creationGateway: OrderCreationGateway;
  tablesGateway: OrderTablesGateway;
}

const getTablesToSynchronize = (
  order: Order,
): string[] =>
  Array.from(
    new Set([
      ...(order.tableId ? [order.tableId] : []),
      ...(order.linkedTables ?? []),
    ]),
  );

export function useOrderTableCommands({
  username,
  updateOrders,
  creationGateway,
  tablesGateway,
}: UseOrderTableCommandsOptions) {
  const moveOrder = useCallback<
    OrderCommands["moveOrder"]
  >(
    (sourceTableId, destinationTableId) => {
      let modifiedOrder: Order | undefined;
      updateOrders((current) => {
        const result = orderMutations.moveOrder(
          current,
          sourceTableId,
          destinationTableId,
        );
        modifiedOrder = result.modified;
        return result.orders;
      });

      if (modifiedOrder) {
        void tablesGateway
          .updateTables(
            modifiedOrder.id,
            getTablesToSynchronize(modifiedOrder),
          )
          .catch((error: unknown) =>
            console.error(
              "Error moving order between tables",
              error,
            ),
          );
      }
    },
    [tablesGateway, updateOrders],
  );

  const unirMesas = useCallback<
    OrderCommands["unirMesas"]
  >(
    (sourceTableId, destinationTableId) => {
      let modifiedOrder: Order | undefined;
      let isNewOrder = false;

      updateOrders((current) => {
        const result = orderMutations.unirMesas(
          current,
          sourceTableId,
          destinationTableId,
        );
        let { modified } = result;
        let nextOrders = result.orders;

        if (!modified) {
          modified = createOrder({
            items: [],
            total: 0,
            tableId: sourceTableId,
            username: username || "admin",
            orderType: "local",
          });
          modified.linkedTables = Array.isArray(
            destinationTableId,
          )
            ? destinationTableId
            : [destinationTableId];
          nextOrders = [modified, ...nextOrders];
          isNewOrder = true;
        }

        modifiedOrder = modified;
        return nextOrders;
      });

      if (!modifiedOrder) return;
      if (isNewOrder) {
        void creationGateway
          .create(modifiedOrder)
          .catch((error: unknown) =>
            console.error(
              "Error creating linked table order",
              error,
            ),
          );
        return;
      }

      void tablesGateway
        .updateTables(
          modifiedOrder.id,
          getTablesToSynchronize(modifiedOrder),
        )
        .catch((error: unknown) =>
          console.error(
            "Error linking order tables",
            error,
          ),
        );
    },
    [
      creationGateway,
      tablesGateway,
      updateOrders,
      username,
    ],
  );

  return {
    moveOrder,
    unirMesas,
  };
}
