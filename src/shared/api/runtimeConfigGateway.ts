import { apiClient } from "./apiClient";

interface ConfigResponse<T> {
  data?: T;
}

export interface RuntimeConfigGateway {
  get<T>(key: string): Promise<T | null>;
  save<T>(key: string, data: T): Promise<void>;
}

export const runtimeConfigGateway: RuntimeConfigGateway = {
  async get<T>(key: string) {
    const response = (await apiClient(
      `/config/${encodeURIComponent(key)}`,
    )) as ConfigResponse<T> | null;
    return response?.data ?? null;
  },

  async save<T>(key: string, data: T) {
    await apiClient(`/config/${encodeURIComponent(key)}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    });
  },
};
