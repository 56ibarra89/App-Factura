import type { Invoice } from "../model/invoice.types";
import {
  ordersGateway,
  type OrderHistoryPage,
  type OrderHistoryQuery,
} from "../../orders";

export interface InvoiceGateway {
  listHistory(
    query: OrderHistoryQuery,
  ): Promise<Omit<OrderHistoryPage, "items"> & { items: Invoice[] }>;
}

export const invoiceGateway: InvoiceGateway = {
  listHistory: (query) => ordersGateway.listHistory(query),
};
