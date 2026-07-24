import { apiClient } from "../../config/apiClient";

export interface Kitchen {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CookKitchenAssignment {
  id: string;
  userId: string;
  kitchenId: string;
  dayOfWeek: string;
}

export interface CookUser {
  id: string;
  firstName: string;
  lastName: string;
  workDays?: string[];
  kitchenAssignments: CookKitchenAssignment[];
}

export interface CookAssignmentPayload {
  dayOfWeek: string;
  kitchenId: string | null;
}

export interface KitchensGateway {
  list(): Promise<Kitchen[]>;
  create(name: string, isActive: boolean): Promise<void>;
  update(id: string, name: string, isActive?: boolean): Promise<void>;
  delete(id: string): Promise<void>;
  listCookAssignments(): Promise<CookUser[]>;
  updateCookAssignments(
    userId: string,
    assignments: CookAssignmentPayload[],
  ): Promise<void>;
}

export const kitchensGateway: KitchensGateway = {
  list: () => apiClient("/kitchens"),

  async create(name, isActive) {
    await apiClient("/kitchens", {
      method: "POST",
      body: JSON.stringify({ name, isActive }),
    });
  },

  async update(id, name, isActive) {
    await apiClient(`/kitchens/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name, isActive }),
    });
  },

  async delete(id) {
    await apiClient(`/kitchens/${id}`, { method: "DELETE" });
  },

  listCookAssignments: () => apiClient("/kitchens/cooks/assignments"),

  async updateCookAssignments(userId, assignments) {
    await apiClient(`/kitchens/cooks/${userId}/assignments`, {
      method: "PATCH",
      body: JSON.stringify({ assignments }),
    });
  },
};
