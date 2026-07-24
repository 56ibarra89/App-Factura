import { useContext } from "react";
import { ProductContext } from "../context/ProductContextDefinition";

export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error(
      "useProductContext debe usarse dentro de ProductProvider",
    );
  }
  return context;
}
