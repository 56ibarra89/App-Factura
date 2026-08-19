import { useState, useEffect, ReactNode, useCallback } from "react";
import type { Category, Product } from "./catalog.types";
import { useAuth } from "../../auth";
import { CatalogContext } from "./CatalogContext";
import {
  productGateway,
  type ProductGateway,
} from "../api/productGateway";

interface CatalogProviderProps {
  children: ReactNode;
  gateway?: ProductGateway;
}

export const CatalogProvider = ({
  children,
  gateway = productGateway,
}: CatalogProviderProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { isLoggedIn, role } = useAuth();

  const loadCategories = useCallback(async () => {
    try {
      const data = await gateway.listCategories();
      setCategories(
        data.map((category) => ({
          ...category,
          items: category.items.map((product) => ({
            ...product,
            categoryId: product.categoryId ?? category.id,
          })),
        })),
      );
    } catch (error) {
      console.error("Error al cargar categorías desde el backend:", error);
    }
  }, [gateway]);

  useEffect(() => {
    if (isLoggedIn && role !== "motorizado") {
      loadCategories();
    } else {
      setCategories([]);
    }
  }, [isLoggedIn, loadCategories, role]);

  const addProduct = async (categoryName: string, product: Product) => {
    try {
      const cat = categories.find(c => c.label === categoryName);
      if (!cat?.id) throw new Error("Categoría no encontrada");
      
      await gateway.createProduct({
        categoryId: cat.id,
        name: product.name,
        description: product.description,
        isActive: true,
        hasMultipleSizes: product.hasMultipleSizes ?? false,
        prices: product.prices,
        extras: product.extras || [],
      });
      await loadCategories();
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }
  };

  const updateProduct = async (categoryName: string, oldName: string, updatedProduct: Product) => {
    try {
      const cat = categories.find(c => c.label === categoryName);
      const prod = cat?.items.find(p => p.name === oldName);
      if (!cat?.id || !prod?.id) throw new Error("Categoría o Producto no encontrado");

      await gateway.updateProduct(prod.id, {
        categoryId: cat.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        isActive: true,
        hasMultipleSizes: updatedProduct.hasMultipleSizes ?? false,
        prices: updatedProduct.prices,
        extras: updatedProduct.extras || [],
      });
      await loadCategories();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  };

  const deleteProduct = async (categoryName: string, productName: string) => {
    try {
      const cat = categories.find(c => c.label === categoryName);
      const prod = cat?.items.find(p => p.name === productName);
      if (prod?.id) {
        await gateway.deleteProduct(prod.id);
        await loadCategories();
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  };

  const addCategory = async (categoryName: string, icon?: string, kitchenId?: string) => {
    try {
      if (categories.some(cat => cat.label === categoryName)) return;
      await gateway.createCategory({ label: categoryName, icon, kitchenId });
      await loadCategories();
    } catch (error) {
      console.error("Error al crear categoría:", error);
      throw error;
    }
  };

  const updateCategory = async (oldName: string, newName: string, icon?: string, kitchenId?: string) => {
    try {
      const cat = categories.find(c => c.label === oldName);
      if (cat?.id) {
        await gateway.updateCategory(cat.id, {
          label: newName,
          icon,
          kitchenId,
        });
        await loadCategories();
      }
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      throw error;
    }
  };

  const deleteCategory = async (categoryName: string) => {
    try {
      const cat = categories.find(c => c.label === categoryName);
      if (cat?.id) {
        await gateway.deleteCategory(cat.id);
        await loadCategories();
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      throw error;
    }
  };

  return (
    <CatalogContext.Provider
      value={{ categories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, refreshCategories: loadCategories }}
    >
      {children}
    </CatalogContext.Provider>
  );
};
