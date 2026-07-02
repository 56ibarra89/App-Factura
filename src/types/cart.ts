// src/types/cart.ts
import { ProductSize } from "./product";
import { SelectedExtra } from "./extras";
import { KitchenStatus } from "./order.types";

export interface CartItemType {
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
}


