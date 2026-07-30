import type { Invoice } from "../model/invoice.types";
import { ordersGateway } from "../../orders";

export interface InvoiceGateway {
  listByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Invoice[]>;
}

export const invoiceGateway: InvoiceGateway = {
  listByDateRange: (startDate, endDate) =>
    ordersGateway.listByDateRange(startDate, endDate),
};
