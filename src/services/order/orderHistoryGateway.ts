import type { Order } from "../../types/order.types";
import { fetchOrdersByDateRange } from "./backendSync";

export interface OrderHistoryGateway {
  listByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Order[]>;
}

export const orderHistoryGateway: OrderHistoryGateway = {
  listByDateRange: fetchOrdersByDateRange,
};
