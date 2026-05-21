export interface ShiftSales {
  cash: number;
  card: number;
  app: number;
  total: number;
}

export interface Shift {
  id: string;
  cashierName: string;
  startTime: Date;
  endTime?: Date;
  openingAmount: number;
  closingAmount?: number;
  totalSales: ShiftSales;
  status: 'open' | 'closed';
  notes?: string;
  cashRegisterName?: string;
}

export interface CashRegisterConfig {
  id: string;
  name: string;
  defaultOpeningAmount: number;
}

export interface ShiftProfileConfig {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  description?: string;
}
