import { apiClient } from "../../config/apiClient";

export interface KitchenTicketPreferencesGateway {
  getHiddenTicketIds(): Promise<string[]>;
  hideTicketIds(ticketIds: string[]): Promise<void>;
}

export const kitchenTicketPreferencesGateway: KitchenTicketPreferencesGateway = {
  getHiddenTicketIds: () => apiClient("/orders/kitchen/hidden-tickets"),

  async hideTicketIds(ticketIds) {
    await apiClient("/orders/kitchen/hidden-tickets", {
      method: "POST",
      body: JSON.stringify({ ticketIds }),
    });
  },
};
