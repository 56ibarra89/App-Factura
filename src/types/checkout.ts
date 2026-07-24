import type { CartItemType } from "./cart";
import type { OrderType, PaymentMethod } from "./order.types";

export interface SplitPaymentAmounts {
  efectivo: number;
  tarjeta: number;
}

export interface PackagingItem {
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutFormValues {
  paymentMethod: PaymentMethod;
  splitAmounts?: SplitPaymentAmounts;
  customerName?: string;
  orderType: OrderType;
  customerAddress?: string;
  packagingItems: PackagingItem[];
  customerTendered?: number;
  driverId?: string;
  deliveryCost?: number;
}

export interface OrderTotals {
  total: number;
  subTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
}

export interface CreateOrderCommand extends OrderTotals {
  items: CartItemType[];
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

export interface RedeemableCertificateItem {
  productId: string;
  quantity: number;
}

export interface RedeemableCertificate {
  id: number;
  serial: string;
  status: string;
  items: RedeemableCertificateItem[];
  description?: string;
  amount?: number;
}
