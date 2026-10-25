import type { Order, OrderStatus } from "../model/order.types";
import type { SplitCheckoutOrderCommand } from "../model/order-command.types";
import {
  fetchOrderHistory,
  fetchOrdersFromBackend,
  syncAddOrderToBackend,
  syncFinalizeOrder,
  syncSplitCheckoutOrder,
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
  listHistory(query: OrderHistoryQuery): Promise<OrderHistoryPage>;
}

export interface OrderHistoryQuery {
  startDate: Date;
  endDate: Date;
  page: number;
  pageSize: number;
  search?: string;
  paymentMethodId?: string;
  view?: "all" | "invoices";
  statuses?: OrderStatus[];
}

export interface OrderHistoryPage {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  paymentMethodOptions: Array<{ id: string; name: string }>;
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
  splitCheckout?(
    parentOrderId: string,
    command: SplitCheckoutOrderCommand,
  ): Promise<{ paidOrder: Order; parentOrder: Order }>;
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
  listHistory: fetchOrderHistory,
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
  splitCheckout: syncSplitCheckoutOrder,
  updateTables: syncUpdateTables,
};
