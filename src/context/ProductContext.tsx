import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Category, Product } from "../types/product";
import { apiClient } from "../config/apiClient";
import { useAuth } from "./AuthContext";

interface ProductContextType {
  categories: Category[];
  addProduct: (category: string, product: Product) => Promise<void>;
  updateProduct: (category: string, oldName: string, updatedProduct: Product) => Promise<void>;
  deleteProduct: (category: string, productName: string) => Promise<void>;
  addCategory: (categoryName: string, icon?: string) => Promise<void>;
  updateCategory: (oldName: string, newName: string, icon?: string) => Promise<void>;
  deleteCategory: (categoryName: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProductContext debe usarse dentro de ProductProvider");
  return context;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { isLoggedIn } = useAuth();

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiClient("/products/categories");
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías desde el backend:", error);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadCategories();
    } else {
      setCategories([]);
    }
  }, [isLoggedIn, loadCategories]);

  const addProduct = async (categoryName: string, product: Product) => {
    try {
      const cat = categories.find(c => c.label === categoryName);
      if (!cat?.id) throw new Error("Categoría no encontrada");
      
      await apiClient('/products', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: cat.id,
          name: product.name,
          description: product.description,
          isActive: true,
          hasMultipleSizes: product.hasMultipleSizes ?? false,
          prices: product.prices,
          extras: product.extras || []
        })
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

      await apiClient(`/products/${prod.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          categoryId: cat.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          isActive: true,
          hasMultipleSizes: updatedProduct.hasMultipleSizes ?? false,
          prices: updatedProduct.prices,
          extras: updatedProduct.extras || []
        })
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
        await apiClient(`/products/${prod.id}`, { method: 'DELETE' });
        await loadCategories();
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  };

  const addCategory = async (categoryName: string, icon?: string) => {
    try {
      if (categories.some(cat => cat.label === categoryName)) return;
      await apiClient('/products/categories', {
        method: 'POST',
        body: JSON.stringify({ label: categoryName, icon })
      });
      await loadCategories();
    } catch (error) {
      console.error("Error al crear categoría:", error);
      throw error;
    }
  };

  const updateCategory = async (oldName: string, newName: string, icon?: string) => {
    try {
      const cat = categories.find(c => c.label === oldName);
      if (cat?.id) {
        await apiClient(`/products/categories/${cat.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ label: newName, icon })
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
        await apiClient(`/products/categories/${cat.id}`, { method: 'DELETE' });
        await loadCategories();
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider
      value={{ categories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, refreshCategories: loadCategories }}
    >
      {children}
    </ProductContext.Provider>
  );
};
