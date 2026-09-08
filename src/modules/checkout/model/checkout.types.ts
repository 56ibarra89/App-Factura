import type {
  OrderType,
  PaymentMethod,
  SplitPaymentAmounts,
} from "../../orders";

export interface PackagingItem {
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutFormValues {
  paymentMethod: PaymentMethod;
  splitAmounts?: SplitPaymentAmounts;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  customerAddress?: string;
  packagingItems: PackagingItem[];
  customerTendered?: number;
  driverId?: string;
  deliveryCost?: number;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryDriverPayout?: number;
  isFreeDelivery?: boolean;
}
