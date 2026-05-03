/* eslint-disable react-refresh/only-export-components */
// src/context/ProductContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Category, Product } from "../types/product";

// Contexto y métodos disponibles
interface ProductContextType {
  categories: Category[];
  addProduct: (category: string, product: Product) => void;
  updateProduct: (category: string, oldName: string, updatedProduct: Product) => void;
  deleteProduct: (category: string, productName: string) => void;
  addCategory: (categoryName: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
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
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error parsing categories from localStorage", e);
    }
    return initialCategories;
  };

  const [categories, setCategories] = useState<Category[]>(loadInitialCategories());

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
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

  const addCategory = (categoryName: string) => {
    setCategories((prev) => {
      if (prev.some(cat => cat.label === categoryName)) return prev;
      return [...prev, { label: categoryName, items: [] }];
    });
  };

  const updateCategory = (oldName: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.label === oldName
          ? { ...cat, label: newName }
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