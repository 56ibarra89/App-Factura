import { createContext, useContext, useState, ReactNode } from "react";

// Tipos para los precios
export type ProductSize = "familiar" | "mediana" | "personal" | "único";

export interface ProductPrice {
  size: ProductSize;
  price: number;
}

export interface Product {
  name: string;
  prices: ProductPrice[];
}

// Cada categoría contiene una etiqueta y sus productos
export interface Category {
  label: string;
  items: Product[];
}

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

// Componente Provider
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([
    { label: "Pizzas", items: [] },
    { label: "Mexicanos", items: [] },
    { label: "Submarinos", items: [] },
    { label: "Alitas", items: [] },
    { label: "Postres", items: [] },
    { label: "Bebidas", items: [] },
    { label: "Combo", items: [] },
  ]);

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