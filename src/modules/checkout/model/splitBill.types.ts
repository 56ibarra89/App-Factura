import type { OrderItem } from "../../orders";

export type SplitBillMode = "items" | "equal" | "custom";

export interface SplitBillAccount {
  id: string;
  name: string;
  items: OrderItem[];
  customAmount?: number;
}

export interface SplitBillAccountTotal extends SplitBillAccount {
  total: number;
}

export interface SplitBillCheckoutSelection {
  mode: SplitBillMode;
  accountId: string;
  accountName: string;
  amount: number;
  items?: OrderItem[];
}
