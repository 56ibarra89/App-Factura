import { apiClient } from "../../../shared/api";

export interface AvailableWaiter {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export const waiterAssignmentsGateway = {
  listActive: (): Promise<AvailableWaiter[]> => apiClient("/users/waiters"),
};
