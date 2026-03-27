// src/types/product.ts
// Tipos relacionados con productos y categorías
import { ExtraIngredientDef } from "./extras";

export type ProductSize = "familiar" | "mediana" | "personal" | "único";

export interface ProductPrice {
  size: ProductSize;
  price: number;
}

export interface Product {
  name: string;
  description?: string;
  prices: ProductPrice[];
  extras?: ExtraIngredientDef[];
}

export interface Category {
  label: string;
  items: Product[];
}

export interface ExtraFormItem {
  name: string;
  prices: { size: string; price: string }[];
}

export interface ProductFormState {
  name: string;
  description: string;
  category: string;
  prices: { size: string; price: string }[];
  singlePrice: string;
}


