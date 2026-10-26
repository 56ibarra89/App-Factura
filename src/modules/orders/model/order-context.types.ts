import type { OrderItem, OrderPromotionSelection } from "./order.types";
import type {
  CreateOrderCommand,
  FinalizeOrderCommand,
  OrderCreationResult,
  SplitCheckoutOrderCommand,
} from "./order-command.types";
import type { Order, OrderStatus } from "./order.types";

export interface OrderQueries {
  orders: Order[];
  getOrderByTable(tableId: string): Order | undefined;
}

export interface OrderCommands {
  addOrder(command: CreateOrderCommand): Promise<OrderCreationResult>;
  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    cancelReason?: string,
    adminPin?: string,
    sentAt?: number,
    kitchenId?: string,
    itemId?: number | string,
    cancelReasonId?: string,
  ): Promise<void>;
  removeOrder(orderId: string): void;
  clearHistory(): void;
  updateOrderItems(
    orderId: string,
    items: OrderItem[],
    total: number,
    subTotal?: number,
    taxAmount?: number,
    discountAmount?: number,
    promotion?: OrderPromotionSelection,
  ): Promise<void>;
  finalizeOrder(
    orderId: string,
    command: FinalizeOrderCommand,
  ): Promise<string | void>;
  splitCheckoutOrder(
    parentOrderId: string,
    command: SplitCheckoutOrderCommand,
  ): Promise<string | void>;
  markAsSentToKitchen(orderId: string): Promise<void>;
  markAsSentToKitchenByTable(tableId: string): Promise<OrderItem[] | undefined>;
  moveOrder(sourceTableId: string, destinationTableId: string | string[]): void;
  unirMesas(sourceTableId: string, destinationTableId: string | string[]): void;
}

export type OrderContextValue = OrderQueries & OrderCommands;
