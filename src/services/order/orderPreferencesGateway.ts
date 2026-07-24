import { apiClient } from "../../config/apiClient";

export interface OrderPreferencesGateway {
  getHiddenOrderIds(): Promise<string[]>;
  hideOrderIds(orderIds: readonly string[]): Promise<void>;
}

export const orderPreferencesGateway: OrderPreferencesGateway = {
  async getHiddenOrderIds() {
    const response: unknown = await apiClient(
      "/users/me/preferences/hidden-orders",
    );
    if (!Array.isArray(response)) return [];

    return response.filter(
      (orderId): orderId is string => typeof orderId === "string",
    );
  },

  async hideOrderIds(orderIds) {
    await apiClient("/users/me/preferences/hidden-orders", {
      method: "PATCH",
      body: JSON.stringify({ addHiddenIds: orderIds }),
    });
  },
};
