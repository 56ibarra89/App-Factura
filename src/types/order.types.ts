import { CartItemType } from "./cart";

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem extends CartItemType {
  id: number;
  timestamp: string;
}

export interface Order {
  id: string;
  items: CartItemType[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  customerName?: string;
  tableId?: string;
}
