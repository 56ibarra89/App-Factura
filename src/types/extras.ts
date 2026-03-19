// src/types/extras.ts
import { ProductSize } from "./product";

/** Precio de un extra para un tamaño específico */
export interface ExtraPrice {
  size: ProductSize;
  price: number;
}

/** Definición de un ingrediente extra en el producto (con precios por tamaño) */
export interface ExtraIngredientDef {
  name: string;
  prices: ExtraPrice[];
}

/** Extra seleccionado en el carrito (precio ya resuelto para el tamaño elegido) */
export interface SelectedExtra {
  name: string;
  price: number;
}
