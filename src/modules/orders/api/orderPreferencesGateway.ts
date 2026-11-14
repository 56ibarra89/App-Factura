import { apiClient } from "../../../shared/api";

export interface OrderPreferencesGateway {
  getHiddenOrderIds(): Promise<string[]>;
  hideOrderIds(orderIds: readonly string[]): Promise<void>;
}

export const orderPreferencesGateway: OrderPreferencesGateway = {
  async getHiddenOrderIds() {
    const response: unknown = await apiClient("/orders/hidden-orders");
    if (!Array.isArray(response)) return [];

    return response.filter(
      (orderId): orderId is string => typeof orderId === "string",
    );
  },

  async hideOrderIds(orderIds) {
    await apiClient("/orders/hidden-orders", {
      method: "POST",
      body: JSON.stringify({ orderIds }),
    });
  },
};
