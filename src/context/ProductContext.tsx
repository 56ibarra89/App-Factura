/* eslint-disable react-refresh/only-export-components */
// src/context/ProductContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { Category, Product } from "../types/product";

// Contexto y métodos disponibles
interface ProductContextType {
  categories: Category[];
  addProduct: (category: string, product: Product) => void;
  updateProduct: (category: string, oldName: string, updatedProduct: Product) => void;
  deleteProduct: (category: string, productName: string) => void;
}

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
  const [categories, setCategories] = useState<Category[]>(initialCategories);

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

  return (
    <ProductContext.Provider
      value={{ categories, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};