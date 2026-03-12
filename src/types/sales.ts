// src/types/sales.ts
export interface SaleItem {
  name: string;
  price: number;
  size: string;
}

export interface SalesContextProps {
  sales: SaleItem[];
  addSale: (item: SaleItem) => void;
}


