// src/types/cart.ts
import { ProductSize } from "./product";

export interface CartItemType {
  name: string;
  price: number;
  size: ProductSize;
  quantity: number;
}


