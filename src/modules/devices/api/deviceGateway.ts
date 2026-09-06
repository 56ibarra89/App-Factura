import { apiClient } from "../../../shared/api";
import type { PrinterConfig } from "./printerConfig.types";

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
  getPrinters(): Promise<PrinterConfig[]>;
  savePrinter(printer: PrinterConfig): Promise<PrinterConfig>;
  deletePrinter(id: string): Promise<void>;
}

export const deviceGateway: DeviceGateway = {
  list: () => apiClient("/devices"),
  async scan() {
    await apiClient("/devices/scan", { method: "POST" });
  },
  getPrinters: () => apiClient("/devices/printers"),
  savePrinter: (printer: PrinterConfig) =>
    apiClient("/devices/printers", {
      method: "POST",
      body: JSON.stringify(printer),
    }),
  deletePrinter: (id: string) =>
    apiClient(`/devices/printers/${id}`, {
      method: "DELETE",
    }),
};
