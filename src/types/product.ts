// src/types/product.ts
// Tipos relacionados con productos y categorías
export type ProductSize = "familiar" | "mediana" | "personal" | "único";

export interface ProductPrice {
  size: ProductSize;
  price: number;
}

export interface Product {
  name: string;
  prices: ProductPrice[];
}

export interface Category {
  label: string;
  items: Product[];
}


