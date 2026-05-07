/* eslint-disable react-refresh/only-export-components */
// src/context/ProductContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Category, Product } from "../types/product";
import { localStore, setJson, tryGetJson } from "../services/storage/storage";

// Contexto y métodos disponibles
interface ProductContextType {
  categories: Category[];
  addProduct: (category: string, product: Product) => void;
  updateProduct: (category: string, oldName: string, updatedProduct: Product) => void;
  deleteProduct: (category: string, productName: string) => void;
  addCategory: (categoryName: string, icon?: string) => void;
  updateCategory: (oldName: string, newName: string, icon?: string) => void;
  deleteCategory: (categoryName: string) => void;
}

const CATEGORIES_STORAGE_KEY = 'app_factura_categories';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Hook personalizado para consumir el contexto
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProductContext debe usarse dentro de ProductProvider");
  return context;
};

import { initialCategories } from "../data/initialData";

// ...

// Componente Provider
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const loadInitialCategories = () => {
    const stored = tryGetJson<Category[]>(localStore, CATEGORIES_STORAGE_KEY);
    return stored ?? initialCategories;
  };

  const [categories, setCategories] = useState<Category[]>(loadInitialCategories());

  useEffect(() => {
    setJson(localStore, CATEGORIES_STORAGE_KEY, categories);
  }, [categories]);

  const addProduct = (category: string, product: Product) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.label === category
          ? {
              ...cat,
              items: [...cat.items, product],
            }
          : cat
      )
    );
  };

  const updateProduct = (category: string, oldName: string, updatedProduct: Product) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.label === category
          ? {
              ...cat,
              items: cat.items.map((p) =>
                p.name === oldName ? updatedProduct : p
              ),
            }
          : cat
      )
    );
  };

  const deleteProduct = (category: string, productName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.label === category
          ? {
              ...cat,
              items: cat.items.filter((p) => p.name !== productName),
            }
          : cat
      )
    );
  };

  const addCategory = (categoryName: string, icon?: string) => {
    setCategories((prev) => {
      if (prev.some(cat => cat.label === categoryName)) return prev;
      return [...prev, { label: categoryName, icon, items: [] }];
    });
  };

  const updateCategory = (oldName: string, newName: string, icon?: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.label === oldName
          ? { ...cat, label: newName, icon: icon !== undefined ? icon : cat.icon }
          : cat
      )
    );
  };

  const deleteCategory = (categoryName: string) => {
    setCategories((prev) => prev.filter(cat => cat.label !== categoryName));
  };

  return (
    <ProductContext.Provider
      value={{ categories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </ProductContext.Provider>
  );
};