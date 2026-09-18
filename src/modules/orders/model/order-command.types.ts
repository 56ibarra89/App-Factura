import type {
  OrderItem,
  OrderPromotionSelection,
  OrderType,
  PaymentMethod,
  OrderPaymentDetail,
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

export interface CreateOrderCommand
  extends OrderTotals, OrderPromotionSelection {
  items: OrderItem[];
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  orderType?: OrderType;
  customerAddress?: string;
  tableId?: string;
  paymentMethod?: PaymentMethod;
  splitAmounts?: SplitPaymentAmounts;
  payments?: OrderPaymentDetail[];
  certificateSerials?: string[];
  driverId?: string;
  customerTendered?: number;
}

export interface FinalizeOrderCommand
  extends OrderTotals, OrderPromotionSelection {
  paymentMethod: PaymentMethod;
  splitAmounts?: SplitPaymentAmounts;
  payments?: OrderPaymentDetail[];
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  orderType?: OrderType;
  customerAddress?: string;
  certificateSerials?: string[];
}
