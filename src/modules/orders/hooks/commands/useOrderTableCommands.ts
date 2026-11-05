import { useCallback } from "react";
import {
  createOrder,
  orderMutations,
} from "../../model/orderDomain";
import type {
  OrderCreationGateway,
  OrderTablesGateway,
} from "../../api/ordersGateway";
import type { OrderCommands } from "../../model/order-context.types";
import type { Order } from "../../model/order.types";
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
      let previousOrder: Order | undefined;

      updateOrders((current) => {
        const result = orderMutations.moveOrder(
          current,
          sourceTableId,
          destinationTableId,
        );
        modifiedOrder = result.modified;
        if (modifiedOrder) {
          previousOrder = current.find(
            (order) => order.id === modifiedOrder?.id,
          );
        }
        return result.orders;
      });

      if (modifiedOrder) {
        const targetOrder = modifiedOrder;
        const snapshotToRestore = previousOrder;
        void tablesGateway
          .updateTables(
            targetOrder.id,
            getTablesToSynchronize(targetOrder),
          )
          .catch((error: unknown) => {
            console.error(
              "Error moving order between tables",
              error,
            );
            if (snapshotToRestore) {
              updateOrders((current) =>
                current.map((order) =>
                  order.id === snapshotToRestore.id
                    ? snapshotToRestore
                    : order,
                ),
              );
            }
          });
      }
    },
    [tablesGateway, updateOrders],
  );

  const unirMesas = useCallback<
    OrderCommands["unirMesas"]
  >(
    (sourceTableId, destinationTableId) => {
      let modifiedOrder: Order | undefined;
      let previousOrder: Order | undefined;
      let isNewOrder = false;

      updateOrders((current) => {
        const result = orderMutations.unirMesas(
          current,
          sourceTableId,
          destinationTableId,
        );
        let { modified } = result;
        let nextOrders = result.orders;

        if (modified) {
          previousOrder = current.find(
            (order) => order.id === modified?.id,
          );
        } else {
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
      const targetOrder = modifiedOrder;
      const snapshotToRestore = previousOrder;

      if (isNewOrder) {
        void creationGateway
          .create(targetOrder)
          .then((persistedOrder) => {
            if (persistedOrder && typeof persistedOrder === "object") {
              updateOrders((current) =>
                current.map((order) =>
                  order.id === targetOrder.id
                    ? {
                        ...order,
                        ...persistedOrder,
                      }
                    : order,
                ),
              );
            }
          })
          .catch((error: unknown) => {
            console.error(
              "Error creating linked table order",
              error,
            );
            updateOrders((current) =>
              current.filter(
                (order) => order.id !== targetOrder.id,
              ),
            );
          });
        return;
      }

      void tablesGateway
        .updateTables(
          targetOrder.id,
          getTablesToSynchronize(targetOrder),
        )
        .catch((error: unknown) => {
          console.error(
            "Error linking order tables",
            error,
          );
          if (snapshotToRestore) {
            updateOrders((current) =>
              current.map((order) =>
                order.id === snapshotToRestore.id
                  ? snapshotToRestore
                  : order,
              ),
            );
          }
        });
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
