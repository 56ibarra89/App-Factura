export { deviceGateway } from "./api/deviceGateway";
export type {
  Device,
  DeviceGateway,
} from "./api/deviceGateway";
export type { PrinterConfig } from "./api/printerConfig.types";
export { printerDispatcherService } from "./services/printerDispatcherService";
export type {
  KitchenComandaData,
  KitchenOrderItem,
  PrintDispatchResult,
} from "./services/printerDispatcherService";
export { useAdminDevices } from "./hooks/useAdminDevices";
export { default as DevicesPage } from "./pages/DevicesPage";
