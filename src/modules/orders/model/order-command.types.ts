import type {
  OrderItem,
  OrderType,
  PaymentMethod,
} from "./order.types";

export interface SplitPaymentAmounts {
  efectivo: number;
  tarjeta: number;
}

export interface OrderTotals {
  total: number;
  subTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
}

export interface CreateOrderCommand extends OrderTotals {
  items: OrderItem[];
  customerName?: string;
  orderType?: OrderType;
  customerAddress?: string;
  tableId?: string;
  paymentMethod?: PaymentMethod;
  splitAmounts?: SplitPaymentAmounts;
  promotionCode?: string;
  certificateSerials?: string[];
  driverId?: string;
  customerTendered?: number;
}

export interface FinalizeOrderCommand extends OrderTotals {
  paymentMethod: PaymentMethod;
  splitAmounts?: SplitPaymentAmounts;
  customerName?: string;
  orderType?: OrderType;
  customerAddress?: string;
  promotionCode?: string;
  certificateSerials?: string[];
}
