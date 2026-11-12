export interface PaymentBreakdownRow {
  id: string;
  name: string;
  type: string;
  currency: string;
  amount: number;
  originalAmount?: number;
  transactionCount: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  totalRevenue: number;
  categoryId?: string;
  categoryName?: string;
}

export interface SalesByTime {
  time: string;
  sales: number;
  ordersCount: number;
}

export interface ChannelSalesSummary {
  type: "delivery" | "llevar" | "local";
  label: string;
  sales: number;
  ordersCount: number;
  percentage: number;
}

export interface SalesReportData {
  totalSales: number;
  cashSales: number;
  cardSales: number;
  appSales: number;
  paymentBreakdown: PaymentBreakdownRow[];
  totalOrders: number;
  totalDiscounts: number;
  discountedOrdersCount: number;
  topProducts: TopProduct[];
  salesByTime: SalesByTime[];
  channelsSummary: ChannelSalesSummary[];
}
