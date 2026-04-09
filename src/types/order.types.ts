import { CartItemType } from "./cart";

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid' | 'cancelled';

export interface OrderItem extends CartItemType {
  id: number;
  timestamp: string;
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'APP' | 'MIXTO';
export type OrderType = 'local' | 'llevar' | 'delivery';

export interface Order {
  id: string;
  items: CartItemType[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  customerName?: string;
  orderType?: OrderType;
  customerAddress?: string;
  tableId?: string;
  paymentMethod?: PaymentMethod;
  splitAmounts?: { efectivo: number; tarjeta: number };
  cashierName?: string;
}
