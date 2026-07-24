import { CartItemType } from "../../types/cart";
import {
  KitchenStatus,
  Order,
  OrderStatus,
} from "../../types/order.types";
import type {
  CreateOrderCommand,
  FinalizeOrderCommand,
} from "../../types/checkout";

export const orderSelectors = {
  getActiveOrderByTable(orders: Order[], tableId: string): Order | undefined {
    return orders.find(
      (order) =>
        (order.tableId === tableId ||
          (order.linkedTables && order.linkedTables.includes(tableId))) &&
        order.status !== "paid" &&
        order.status !== "cancelled",
    );
  },
};

type UpdateResult = { orders: Order[]; modified?: Order };

function updateOne(
  orders: Order[],
  predicate: (order: Order) => boolean,
  updater: (order: Order) => Order,
): UpdateResult {
  let modified: Order | undefined;
  const next = orders.map((order) => {
    if (!predicate(order)) return order;
    const updated = updater(order);
    if (!modified && updated !== order) modified = updated;
    return updated;
  });
  return { orders: next, modified };
}

export function createOrder(
  params: CreateOrderCommand & {
    username?: string | null;
  },
): Order {
  const {
    items,
    total,
    username,
    customerName,
    orderType,
    customerAddress,
    driverId,
    tableId,
    paymentMethod,
    splitAmounts,
    subTotal,
    taxAmount,
    discountAmount,
    promotionCode,
    certificateSerials,
    customerTendered,
  } = params;

  const nowMs = Date.now();
  let deliveryChange: number | undefined = undefined;
  if (customerTendered !== undefined && customerTendered > total) {
    deliveryChange = customerTendered - total;
  }

  const baseOrder: Order = {
    id: `ORD-${nowMs}`,
    items: [...items],
    subTotal,
    discountAmount,
    taxAmount,
    total,
    status: paymentMethod ? "paid" : "pending",
    timestamp: new Date(nowMs),
    customerName,
    orderType,
    customerAddress,
    driverId,
    customerTendered,
    deliveryChange,
    promotionCode,
    certificateSerials,
    tableId,
    paymentMethod,
    splitAmounts,
    cashierName: username || "Sistema",
    isSentToKitchen: !tableId,
  };

  if (!baseOrder.isSentToKitchen) return baseOrder;

  return {
    ...baseOrder,
    items: baseOrder.items.map((item) => ({
      ...item,
      isSentToKitchen: true,
      sentAt: nowMs,
      kitchenStatus: "pending",
    })),
  };
}

export const orderMutations = {
  updateOrderStatus(
    prev: Order[],
    orderId: string,
    status: OrderStatus,
    sentAt?: number,
    kitchenId?: string,
    itemId?: number | string,
  ): UpdateResult {
    return updateOne(
      prev,
      (order) => order.id === orderId,
      (order) => {
        if (sentAt) {
          const kitchenStatus = status as KitchenStatus;
          const updatedItems = order.items.map((item) => {
            const matchSentAt = true; // El backend actualiza sin considerar sentAt preciso ya
            const matchKitchenId = kitchenId ? item.kitchenId === kitchenId : true;
            const matchItemId = itemId !== undefined ? item.id === itemId : true;
            
            if (matchSentAt && matchKitchenId && matchItemId) {
              return { ...item, kitchenStatus };
            }
            return item;
          });

          const allDelivered = updatedItems.every(
            (item) => item.kitchenStatus === "delivered" || !item.isSentToKitchen,
          );
          const anyPending = updatedItems.some(
            (item) => item.kitchenStatus === "pending" && item.isSentToKitchen,
          );
          const anyPreparing = updatedItems.some(
            (item) => item.kitchenStatus === "preparing" && item.isSentToKitchen,
          );
          const anyReady = updatedItems.some(
            (item) => item.kitchenStatus === "ready" && item.isSentToKitchen,
          );

          let globalStatus = order.status;
          if (globalStatus !== "paid" && globalStatus !== "cancelled") {
            if (allDelivered && updatedItems.length > 0) globalStatus = "delivered";
            else if (anyPending) globalStatus = "pending";
            else if (anyPreparing) globalStatus = "preparing";
            else if (anyReady) globalStatus = "ready";
          }

          return { ...order, status: globalStatus, items: updatedItems };
        }

        const kitchenStatus = status as KitchenStatus;

        const nextStatus =
          order.status === "paid" || order.status === "cancelled" ? order.status : status;

        return {
          ...order,
          status: nextStatus,
          items: order.items.map((item) => ({ ...item, kitchenStatus })),
        };
      },
    );
  },

  updateOrderItems(
    prev: Order[],
    orderId: string,
    items: CartItemType[],
    total: number,
  ): UpdateResult {
    return updateOne(
      prev,
      (order) => order.id === orderId,
      (order) => {
        const hasNewItems = items.some((item) => !item.isSentToKitchen);

        const sentItems = items.filter((item) => item.isSentToKitchen);
        const allDelivered =
          sentItems.length > 0 &&
          sentItems.every((item) => item.kitchenStatus === "delivered");
        const anyPreparing = sentItems.some(
          (item) => item.kitchenStatus === "preparing",
        );
        const anyReady = sentItems.some((item) => item.kitchenStatus === "ready");

        let newStatus = order.status;
        if (hasNewItems) newStatus = "pending";
        else if (allDelivered) newStatus = "delivered";
        else if (anyReady) newStatus = "ready";
        else if (anyPreparing) newStatus = "preparing";

        return { ...order, items: [...items], total, status: newStatus };
      },
    );
  },

  finalizeOrder(
    prev: Order[],
    orderId: string,
    params: FinalizeOrderCommand,
  ): UpdateResult {
    const {
      paymentMethod,
      splitAmounts,
      customerName,
      orderType,
      customerAddress,
      total,
      subTotal,
      taxAmount,
      discountAmount,
      promotionCode,
      certificateSerials,
    } = params;

    return updateOne(
      prev,
      (order) => order.id === orderId,
      (order) => {
        const nowMs = Date.now();
        const updatedItems = order.items.map((item) => {
          if (!item.isSentToKitchen) {
            return {
              ...item,
              isSentToKitchen: true,
              sentAt: nowMs,
              kitchenStatus: "pending" as KitchenStatus,
            };
          }
          return item;
        });

        return {
          ...order,
          status: "paid" as OrderStatus,
          paymentMethod,
          splitAmounts,
          customerName: customerName || order.customerName,
          orderType: orderType || order.orderType,
          customerAddress: customerAddress || order.customerAddress,
          promotionCode: promotionCode || order.promotionCode,
          certificateSerials:
            certificateSerials ?? order.certificateSerials,
          total,
          subTotal: typeof subTotal === "number" ? subTotal : order.subTotal,
          discountAmount: typeof discountAmount === "number" ? discountAmount : order.discountAmount,
          taxAmount: typeof taxAmount === "number" ? taxAmount : order.taxAmount,
          isSentToKitchen: true,
          items: updatedItems,
        };
      },
    );
  },

  markAsSentToKitchen(prev: Order[], orderId: string, nowMs: number): UpdateResult {
    return updateOne(
      prev,
      (order) => order.id === orderId,
      (order) => ({
        ...order,
        isSentToKitchen: true,
        items: order.items.map((item) => ({
          ...item,
          isSentToKitchen: true,
          sentAt: item.isSentToKitchen ? item.sentAt : nowMs,
          kitchenStatus: item.isSentToKitchen ? item.kitchenStatus : "pending",
        })),
      }),
    );
  },

  markAsSentToKitchenByTable(
    prev: Order[],
    tableId: string,
    nowMs: number,
  ): UpdateResult {
    return updateOne(
      prev,
      (order) =>
        order.tableId === tableId &&
        order.status !== "paid" &&
        order.status !== "cancelled",
      (order) => ({
        ...order,
        isSentToKitchen: true,
        items: order.items.map((item) => ({
          ...item,
          isSentToKitchen: true,
          sentAt: item.isSentToKitchen ? item.sentAt : nowMs,
          kitchenStatus: item.isSentToKitchen ? item.kitchenStatus : "pending",
        })),
      }),
    );
  },

  moveOrder(
    prev: Order[],
    sourceTableId: string,
    destTableId: string | string[],
  ): UpdateResult {
    return updateOne(
      prev,
      (order) =>
        (order.tableId === sourceTableId ||
          !!(order.linkedTables && order.linkedTables.includes(sourceTableId))) &&
        order.status !== "paid" &&
        order.status !== "cancelled",
      (order) => {
        if (Array.isArray(destTableId)) {
          return {
            ...order,
            tableId: destTableId[0],
            linkedTables: destTableId.slice(1),
          };
        }
        return {
          ...order,
          tableId: destTableId,
          linkedTables: [], // Al mover a una sola mesa, liberamos todas las anteriores
        };
      },
    );
  },

  unirMesas(
    prev: Order[],
    sourceTableId: string,
    destTableId: string | string[],
  ): UpdateResult {
    return updateOne(
      prev,
      (order) =>
        (order.tableId === sourceTableId ||
          !!(order.linkedTables && order.linkedTables.includes(sourceTableId))) &&
        order.status !== "paid" &&
        order.status !== "cancelled",
      (order) => {
        const linkedTables = order.linkedTables || [];
        const newTables = Array.isArray(destTableId) ? destTableId : [destTableId];

        const updatedLinkedTables = [...linkedTables];
        newTables.forEach((tableId) => {
          if (
            !updatedLinkedTables.includes(tableId) &&
            order.tableId !== tableId
          ) {
            updatedLinkedTables.push(tableId);
          }
        });

        return { ...order, linkedTables: updatedLinkedTables };
      },
    );
  },

  clearHistory(prev: Order[]): UpdateResult {
    const next = prev.filter(
      (order) => order.status !== "paid" && order.status !== "cancelled",
    );
    return { orders: next };
  },
};
