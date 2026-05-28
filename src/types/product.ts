// src/types/product.ts
// Tipos relacionados con productos y categorías
import { ExtraIngredientDef } from "./extras";

export type ProductSize = "familiar" | "mediana" | "personal" | "único";

export interface ProductPrice {
  size: ProductSize;
  price: number;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  prices: ProductPrice[];
  hasMultipleSizes?: boolean;
  extras?: ExtraIngredientDef[];
}

export interface Category {
  id?: string;
  label: string;
  icon?: string;
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
  hasMultipleSizes: boolean;
  prices: { size: string; price: string }[];
  singlePrice: string;
}


