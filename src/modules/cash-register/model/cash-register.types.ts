import type { CashExpense } from "./cash-expense.types";

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
  totalExpenses?: number;
  totalExpensesSnapshot?: number;
  expectedCash?: number;
  cashDifference?: number;
  declaredCardAmount?: number;
  cardDifference?: number;
  declaredAppAmount?: number;
  appDifference?: number;
  totalDeclaredAmount?: number;
  totalDifference?: number;
  discrepancyReason?: string;
  authorizedById?: string;
  authorizedByName?: string;
  authorizedByRole?: string;
  denominationBreakdown?: CashDenominationCount[];
  expenses?: CashExpense[];
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
  declaredCardAmount?: number;
  declaredAppAmount?: number;
  notes?: string;
  discrepancyReason?: string;
  authorizationPin?: string;
  denominationBreakdown?: CashDenominationCount[];
}

export interface CashDenominationCount {
  denomination: number;
  quantity: number;
}

export interface ShiftCloseBlockingOrder {
  id: string;
  invoiceNumber?: string;
  status: string;
  tables: string[];
}

export interface ShiftCloseBlockingTable {
  id: string;
  label: string;
  orderIds: string[];
}

export interface ShiftClosePreview {
  shiftId: string;
  discrepancyThreshold: number;
  blockingOrders: ShiftCloseBlockingOrder[];
  blockingTables: ShiftCloseBlockingTable[];
  canClose: boolean;
  requiresAuthorization?: boolean;
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
