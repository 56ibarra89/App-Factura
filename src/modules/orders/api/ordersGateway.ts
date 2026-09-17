import type { Order, OrderStatus } from "../model/order.types";
import {
  fetchOrdersByDateRange,
  fetchOrdersFromBackend,
  syncAddOrderToBackend,
  syncFinalizeOrder,
  syncStartDelivery,
  syncUpdateOrderItems,
  syncUpdateOrderStatus,
  syncUpdateTables,
} from "./backendSync";

export interface UpdateOrderStatusCommand {
  orderId: string;
  status: OrderStatus;
  cancelReason?: string;
  adminPin?: string;
  sentAt?: number;
  kitchenId?: string;
  itemId?: number | string;
  cancelReasonId?: string;
}

export interface CurrentOrdersGateway {
  listCurrent(): Promise<Order[]>;
}

export interface OrderHistoryGateway {
  listByDateRange(startDate: Date, endDate: Date): Promise<Order[]>;
}

export interface OrderCreationGateway {
  create(order: Order): Promise<Order>;
}

export interface OrderStatusGateway {
  updateStatus(command: UpdateOrderStatusCommand): Promise<void>;
  startDelivery(orderId: string): Promise<void>;
}

export interface OrderItemsGateway {
  updateItems(order: Order): Promise<Order>;
}

export interface OrderFinalizationGateway {
  finalize(order: Order): Promise<Order>;
}

export interface OrderTablesGateway {
  updateTables(orderId: string, linkedTables: string[]): Promise<void>;
}

export type OrdersGateway = CurrentOrdersGateway &
  OrderHistoryGateway &
  OrderCreationGateway &
  OrderStatusGateway &
  OrderItemsGateway &
  OrderFinalizationGateway &
  OrderTablesGateway;

export const ordersGateway: OrdersGateway = {
  listCurrent: fetchOrdersFromBackend,
  listByDateRange: fetchOrdersByDateRange,
  create: syncAddOrderToBackend,
  updateStatus: ({
    orderId,
    status,
    cancelReason,
    adminPin,
    sentAt,
    kitchenId,
    itemId,
    cancelReasonId,
  }) =>
    syncUpdateOrderStatus(
      orderId,
      status,
      cancelReason,
      adminPin,
      sentAt,
      kitchenId,
      itemId,
      cancelReasonId,
    ),
  startDelivery: syncStartDelivery,
  updateItems: syncUpdateOrderItems,
  finalize: syncFinalizeOrder,
  updateTables: syncUpdateTables,
};
