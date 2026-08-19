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

export type CashRegisterType = 'Principal' | 'Auxiliar' | 'Delivery';

export interface CashRegisterConfig {
  id: string;
  name: string;
  defaultOpeningAmount: number;
  type?: CashRegisterType;
  assignedUserIds?: string[];
  assignedUserNames?: string[];

  assignedUserId?: string;
  assignedUserName?: string;
}

export interface OpenShiftData {
  cashierName: string;
  openingAmount: number;
  cashRegisterName?: string;
}

export interface CloseShiftData {
  closingAmount: number;
  notes?: string;
}

export interface ShiftProfileConfig {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  assignedRole?: string;
  assignedUserIds?: string[];
  assignedUserNames?: string[];
  daysOfWeek?: number[];
}

export interface CashRegisterConfigState {
  cashRegisters: CashRegisterConfig[];
  shiftProfiles: ShiftProfileConfig[];
}

