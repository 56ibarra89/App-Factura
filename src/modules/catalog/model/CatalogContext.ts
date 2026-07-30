import { createContext } from "react";
import type { Category, Product } from "./catalog.types";

export interface CatalogContextValue {
  categories: Category[];
  addProduct(category: string, product: Product): Promise<void>;
  updateProduct(
    category: string,
    oldName: string,
    updatedProduct: Product,
  ): Promise<void>;
  deleteProduct(category: string, productName: string): Promise<void>;
  addCategory(
    categoryName: string,
    icon?: string,
    kitchenId?: string,
  ): Promise<void>;
  updateCategory(
    oldName: string,
    newName: string,
    icon?: string,
    kitchenId?: string,
  ): Promise<void>;
  deleteCategory(categoryName: string): Promise<void>;
  refreshCategories(): Promise<void>;
}

export const CatalogContext = createContext<
  CatalogContextValue | undefined
>(undefined);
