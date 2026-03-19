// src/types/sales.ts
import { SelectedExtra } from "./extras";

export interface SaleItem {
  name: string;
  price: number;
  size: string;
  extras: SelectedExtra[];
  note?: string;
}

export interface SalesContextProps {
  sales: SaleItem[];
  addSale: (item: SaleItem) => void;
}


