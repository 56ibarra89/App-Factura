export type PrinterRole = "cashier" | "kitchen" | "both";
export type PrinterConnectionType = "usb" | "network";

export interface PrinterConfig {
  id: string;
  name: string; // ej. "Impresora Caja" o "Impresora Cocina"
  role: PrinterRole;
  connectionType: PrinterConnectionType;
  windowsDeviceName?: string; // Para tipo USB (nombre del driver en Windows)
  ipAddress?: string; // Para tipo Network
  port?: number; // 9100 por defecto
  openCashDrawer?: boolean;
  fallbackPrinterId?: string; // ID de la impresora de respaldo
  isActive: boolean;
}

export interface ElectronSystemPrinter {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
  options?: Record<string, string>;
}
