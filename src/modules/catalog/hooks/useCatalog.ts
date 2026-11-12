import { useContext } from "react";
import { CatalogContext } from "../model/CatalogContext";

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error(
      "useCatalog debe usarse dentro de CatalogProvider",
    );
  }
  return context;
}
