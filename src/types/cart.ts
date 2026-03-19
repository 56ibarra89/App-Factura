// src/types/cart.ts
import { ProductSize } from "./product";
import { SelectedExtra } from "./extras";

export interface CartItemType {
  name: string;
  price: number;
  size: ProductSize;
  quantity: number;
  extras: SelectedExtra[];
  note?: string;
}


