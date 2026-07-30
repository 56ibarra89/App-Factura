import type {
  ProductSize,
  SelectedExtra,
} from "../../catalog";

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid' | 'cancelled';
export type KitchenStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'APP' | 'MIXTO';
export type OrderType = 'local' | 'llevar' | 'delivery';

export interface OrderItem {
  id?: number | string;
  productId?: string;
  name: string;
  price: number;
  size: ProductSize;
  quantity: number;
  extras: SelectedExtra[];
  note?: string;
  giftQuantity?: number;
  isSentToKitchen?: boolean;
  sentAt?: number;
  kitchenStatus?: KitchenStatus;
  kitchenId?: string;
  certificateSerial?: string;
}

export type OrderItemInput = Pick<
  OrderItem,
  "name" | "price" | "size" | "extras"
> &
  Partial<
    Pick<
      OrderItem,
      "productId" | "note" | "giftQuantity" | "kitchenId" | "certificateSerial"
    >
  >;

export interface Order {
  id: string;
  items: OrderItem[];
  subTotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  total: number;
  status: OrderStatus;
  timestamp: Date;
  customerName?: string;
  orderType?: OrderType;
  customerAddress?: string;
  driverId?: string;
  promotionCode?: string;
  certificateSerials?: string[];
  tableId?: string;
  customerTendered?: number;
  deliveryChange?: number;
  paymentMethod?: PaymentMethod;
  splitAmounts?: { efectivo: number; tarjeta: number };
  cashierName?: string;
  isSentToKitchen?: boolean;
  linkedTables?: string[];
  invoiceNumber?: string;
}
