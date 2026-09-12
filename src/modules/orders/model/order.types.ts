import type {
  ProductSize,
  SelectedExtra,
} from "../../catalog";

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid' | 'cancelled';
export type KitchenStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'APP' | 'MIXTO';
export type OrderType = 'local' | 'llevar' | 'delivery';
export type OrderPromotionSource = 'none' | 'coupon' | 'discount' | 'happy-hour';

export interface OrderPromotionSelection {
  promotionSource?: OrderPromotionSource;
  promotionCode?: string;
  couponId?: number;
  discountId?: number;
  happyHourId?: number;
}

export interface SelectedComboOptionItem {
  groupId: string;
  groupName: string;
  productId: string;
  productName: string;
  size?: string;
  quantity: number;
  extraPrice: number;
  kitchenId?: string;
  categoryId?: string;
  categoryName?: string;
  kitchenStatus?: KitchenStatus;
}

export interface OrderItem {
  id?: number | string;
  productId?: string;
  categoryId?: string;
  name: string;
  price: number;
  size: ProductSize;
  quantity: number;
  extras: SelectedExtra[];
  note?: string;
  giftQuantity?: number;
  giftReason?: string;
  isSentToKitchen?: boolean;
  sentAt?: number;
  kitchenStatus?: KitchenStatus;
  kitchenId?: string;
  certificateSerial?: string;
  isCombo?: boolean;
  comboSelections?: SelectedComboOptionItem[];
}

export type OrderItemInput = Pick<
  OrderItem,
  "name" | "price" | "size" | "extras"
> &
  Partial<
    Pick<
      OrderItem,
      "productId" | "note" | "giftQuantity" | "giftReason" | "kitchenId" | "certificateSerial"
      | "categoryId" | "isCombo" | "comboSelections"
    >
  >;

export interface OrderPaymentDetail {
  method: 'EFECTIVO' | 'TARJETA' | 'APP';
  amount: number;
  reference?: string;
  cashierSnapshotName?: string;
}

export interface Order extends OrderPromotionSelection {
  id: string;
  items: OrderItem[];
  subTotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  total: number;
  status: OrderStatus;
  timestamp: Date;
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  orderType?: OrderType;
  customerAddress?: string;
  driverId?: string;
  certificateSerials?: string[];
  tableId?: string;
  customerTendered?: number;
  deliveryChange?: number;
  paymentMethod?: PaymentMethod;
  splitAmounts?: {
    efectivo?: number;
    tarjeta?: number;
    app?: number;
  };
  payments?: OrderPaymentDetail[];
  cashierName?: string;
  isSentToKitchen?: boolean;
  linkedTables?: string[];
  invoiceNumber?: string;
}
