import type { CartItemType } from "./cart";
import type {
  CreateOrderCommand,
  FinalizeOrderCommand,
} from "./checkout";
import type { Order, OrderStatus } from "./order.types";

export interface OrderQueries {
  orders: Order[];
  getOrderByTable(tableId: string): Order | undefined;
}

export interface OrderCommands {
  addOrder(command: CreateOrderCommand): Promise<string | void>;
  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    cancelReason?: string,
    adminPin?: string,
    sentAt?: number,
    kitchenId?: string,
    itemId?: number | string,
  ): void;
  removeOrder(orderId: string): void;
  clearHistory(): void;
  updateOrderItems(
    orderId: string,
    items: CartItemType[],
    total: number,
    subTotal?: number,
    taxAmount?: number,
  ): Promise<void>;
  finalizeOrder(
    orderId: string,
    command: FinalizeOrderCommand,
  ): Promise<string | void>;
  markAsSentToKitchen(orderId: string): void;
  markAsSentToKitchenByTable(tableId: string): void;
  moveOrder(
    sourceTableId: string,
    destinationTableId: string | string[],
  ): void;
  unirMesas(
    sourceTableId: string,
    destinationTableId: string | string[],
  ): void;
}

export type OrderContextValue = OrderQueries & OrderCommands;
