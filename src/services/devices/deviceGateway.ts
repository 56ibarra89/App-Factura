import { apiClient } from "../../config/apiClient";

export interface Device {
  id: string;
  name: string;
  type: "printer" | "drawer" | "scale";
  status: "connected" | "disconnected";
  details: string;
  isDefault?: boolean;
}

export interface DeviceGateway {
  list(): Promise<Device[]>;
  scan(): Promise<void>;
}

export const deviceGateway: DeviceGateway = {
  list: () => apiClient("/devices"),
  async scan() {
    await apiClient("/devices/scan", { method: "POST" });
  },
};
