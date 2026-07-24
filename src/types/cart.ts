// src/types/cart.ts
import { ProductSize } from "./product";
import { SelectedExtra } from "./extras";
import { KitchenStatus } from "./order.types";

export interface CartItemType {
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

export type CartItemInput = Pick<
  CartItemType,
  "name" | "price" | "size" | "extras"
> &
  Partial<
    Pick<
      CartItemType,
      "productId" | "note" | "giftQuantity" | "kitchenId" | "certificateSerial"
    >
  >;

