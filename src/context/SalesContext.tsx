// src/context/SalesContext.tsx
import React, { createContext, useContext, useState } from "react";

type SaleItem = {
  name: string;
  price: number;
  size: string;
};

interface SalesContextProps {
  sales: SaleItem[];
  addSale: (item: SaleItem) => void;
}

const SalesContext = createContext<SalesContextProps | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<SaleItem[]>([]);

  const addSale = (item: SaleItem) => {
    setSales(prev => [...prev, item]);
  };

  return (
    <SalesContext.Provider value={{ sales, addSale }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSalesContext = () => {
  const context = useContext(SalesContext);
  if (!context) throw new Error("SalesContext debe usarse dentro de <SalesProvider>");
  return context;
};