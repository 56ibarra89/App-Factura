import { apiClient } from "../../../shared/api";
import type { Category, Product } from "../model/catalog.types";

export interface ProductPayload {
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  hasMultipleSizes: boolean;
  prices: Product["prices"];
  extras: NonNullable<Product["extras"]>;
}

export interface CategoryPayload {
  label: string;
  icon?: string;
  kitchenId?: string;
}

export interface ProductGateway {
  listCategories(): Promise<Category[]>;
  createProduct(payload: ProductPayload): Promise<void>;
  updateProduct(id: string, payload: ProductPayload): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  createCategory(payload: CategoryPayload): Promise<void>;
  updateCategory(id: string, payload: CategoryPayload): Promise<void>;
  deleteCategory(id: string): Promise<void>;
}

export const productGateway: ProductGateway = {
  listCategories: () => apiClient("/products/categories"),

  async createProduct(payload) {
    await apiClient("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateProduct(id, payload) {
    await apiClient(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteProduct(id) {
    await apiClient(`/products/${id}`, { method: "DELETE" });
  },

  async createCategory(payload) {
    await apiClient("/products/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateCategory(id, payload) {
    await apiClient(`/products/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteCategory(id) {
    await apiClient(`/products/categories/${id}`, { method: "DELETE" });
  },
};
