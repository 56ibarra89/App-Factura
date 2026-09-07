import { deviceGateway } from "../api/deviceGateway";
import type { PrinterConfig } from "../api/printerConfig.types";
import { EscPosBuilder } from "../../../shared/printing/escposBuilder";

export interface KitchenOrderItem {
  name: string;
  quantity: number;
  size?: string;
  note?: string;
  extras?: Array<{ name: string }>;
}

export interface KitchenComandaData {
  orderId?: string;
  tableNumber?: string | number;
  orderType?: string;
  waiterOrCashier?: string;
  items: KitchenOrderItem[];
  timestamp?: number | string | Date;
}

export interface PrintDispatchResult {
  success: boolean;
  redirected?: boolean;
  originalPrinter?: string;
  fallbackPrinter?: string;
  error?: string;
}

class PrinterDispatcherService {
  private cachedPrinters: PrinterConfig[] | null = null;
  private lastFetchTime = 0;

  /**
   * Obtiene la configuración de impresoras con caché de corta duración (5s)
   */
  async getPrinters(forceRefresh = false): Promise<PrinterConfig[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedPrinters && now - this.lastFetchTime < 5000) {
      return this.cachedPrinters;
    }
    try {
      this.cachedPrinters = await deviceGateway.getPrinters();
      this.lastFetchTime = now;
      return this.cachedPrinters;
    } catch (error) {
      console.error("Error al obtener impresoras del backend:", error);
      return this.cachedPrinters || [];
    }
  }

  /**
   * Guarda o actualiza una impresora y renueva la caché
   */
  async savePrinter(printer: PrinterConfig): Promise<PrinterConfig> {
    const saved = await deviceGateway.savePrinter(printer);
    await this.getPrinters(true);
    return saved;
  }

  /**
   * Elimina una impresora y renueva la caché
   */
  async deletePrinter(id: string): Promise<void> {
    await deviceGateway.deletePrinter(id);
    await this.getPrinters(true);
  }

  /**
   * Obtiene la impresora designada para cocina
   */
  async getKitchenPrinter(): Promise<PrinterConfig | undefined> {
    const printers = await this.getPrinters();
    return (
      printers.find((p) => p.isActive && p.role === "kitchen") ||
      printers.find((p) => p.isActive && p.role === "both")
    );
  }

  /**
   * Obtiene la impresora designada para facturación / caja
   */
  async getCashierPrinter(): Promise<PrinterConfig | undefined> {
    const printers = await this.getPrinters();
    return (
      printers.find((p) => p.isActive && p.role === "cashier") ||
      printers.find((p) => p.isActive && p.role === "both")
    );
  }

  /**
   * Prueba la conectividad de red con una impresora (Ping TCP 9100)
   */
  async testNetwork(
    host: string,
    port = 9100,
  ): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
    if (window.printAPI?.testNetworkPrinter) {
      return await window.printAPI.testNetworkPrinter({ host, port, timeoutMs: 3000 });
    }
    return {
      success: false,
      error: "La API nativa de Electron no está disponible en este entorno",
    };
  }

  /**
   * Envía un ticket de prueba a la impresora especificada
   */
  async printTestTicket(printer: PrinterConfig): Promise<PrintDispatchResult> {
    const builder = new EscPosBuilder();
    const now = new Date();

    builder
      .align("center")
      .size("large")
      .bold(true)
      .line("PIZZA TO GO")
      .size("normal")
      .bold(false)
      .line("PRUEBA DE IMPRESION")
      .separator("=")
      .align("left")
      .line(`Impresora: ${printer.name}`)
      .line(`Rol: ${printer.role.toUpperCase()}`)
      .line(
        `Tipo: ${printer.connectionType === "network" ? "RED LAN (TCP/IP)" : "CABLE USB (WINDOWS)"}`,
      );

    if (printer.connectionType === "network") {
      builder.line(`Direccion: ${printer.ipAddress}:${printer.port || 9100}`);
    } else if (printer.windowsDeviceName) {
      builder.line(`Dispositivo: ${printer.windowsDeviceName}`);
    }

    builder
      .line(`Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)
      .separator("-")
      .align("center")
      .bold(true)
      .line("ESTADO: COMUNICACION EXITOSA")
      .bold(false)
      .separator("=")
      .feed(2);

    if (printer.openCashDrawer) {
      builder.openCashDrawer();
    }

    builder.cut();

    // Impresión por Red LAN
    if (printer.connectionType === "network") {
      if (!printer.ipAddress) {
        return { success: false, error: "La impresora no tiene dirección IP configurada." };
      }
      if (!window.printAPI?.printNetworkRaw) {
        return { success: false, error: "printNetworkRaw no disponible en Electron." };
      }

      const res = await window.printAPI.printNetworkRaw({
        host: printer.ipAddress,
        port: printer.port || 9100,
        data: builder.toBytes(),
        timeoutMs: 3000,
      });

      return res;
    }

    // Impresión por Windows / USB
    if (window.printAPI?.printSilent) {
      window.printAPI.printSilent({ deviceName: printer.windowsDeviceName });
      if (printer.openCashDrawer && window.printAPI.openCashDrawer) {
        await window.printAPI.openCashDrawer({ deviceName: printer.windowsDeviceName });
      }
      return { success: true };
    }

    window.print();
    return { success: true };
  }

  /**
   * Construye el buffer binario ESC/POS para comanda de cocina
   */
  private buildKitchenComandaBuffer(data: KitchenComandaData): Uint8Array {
    const builder = new EscPosBuilder();
    const dateStr = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    builder
      .align("center")
      .size("double-height")
      .bold(true)
      .line("=== ORDEN COCINA ===")
      .size("large");

    if (data.tableNumber !== undefined && data.tableNumber !== null && data.tableNumber !== "") {
      builder.line(`MESA: ${data.tableNumber}`);
    } else {
      builder.line(`${(data.orderType || "PARA LLEVAR").toUpperCase()}`);
    }

    builder
      .size("normal")
      .bold(false)
      .align("left")
      .separator("-");

    if (data.orderId) {
      builder.line(`Orden #: ${data.orderId.slice(-6)}`);
    }
    if (data.waiterOrCashier) {
      builder.line(`Atiende: ${data.waiterOrCashier}`);
    }
    builder.line(`Hora: ${dateStr}`);
    builder.separator("=");

    // Listado de ítems
    data.items.forEach((item) => {
      builder.bold(true).size("double-height");
      const sizeText = item.size ? ` (${item.size})` : "";
      builder.line(`[ ${item.quantity} ] ${item.name.toUpperCase()}${sizeText}`);

      builder.size("normal").bold(false);

      if (item.extras && item.extras.length > 0) {
        item.extras.forEach((extra) => {
          builder.line(`   + Extra: ${extra.name}`);
        });
      }

      if (item.note) {
        builder.bold(true);
        builder.line(`   * NOTA: ${item.note}`);
        builder.bold(false);
      }
      builder.feed(1);
    });

    builder
      .separator("=")
      .feed(2)
      .cut();

    return builder.toBytes();
  }

  /**
   * Despacha una comanda a la impresora de cocina con soporte de FAILOVER / RESPALDO automático
   */
  async printKitchenComanda(data: KitchenComandaData): Promise<PrintDispatchResult> {
    if (!data.items || data.items.length === 0) {
      return { success: true };
    }

    const kitchenPrinter = await this.getKitchenPrinter();

    // Si no hay impresora de cocina configurada, usar caja como fallback directo
    if (!kitchenPrinter) {
      const cashierPrinter = await this.getCashierPrinter();
      if (cashierPrinter) {
        this.printToCashierPrinter(data, cashierPrinter);
        return {
          success: true,
          redirected: true,
          originalPrinter: "Ninguna (No configurada)",
          fallbackPrinter: cashierPrinter.name,
        };
      }
      return { success: false, error: "No hay impresoras activas configuradas en el sistema." };
    }

    const comandaBuffer = this.buildKitchenComandaBuffer(data);

    // Si la impresora de cocina es de RED LAN (TCP/IP RAW)
    if (kitchenPrinter.connectionType === "network") {
      const host = kitchenPrinter.ipAddress || "";
      const port = kitchenPrinter.port || 9100;

      if (!host) {
        return await this.executeFailover(
          kitchenPrinter,
          data,
          comandaBuffer,
          "La impresora de cocina no tiene IP configurada",
        );
      }

      if (window.printAPI?.printNetworkRaw) {
        try {
          const result = await window.printAPI.printNetworkRaw({
            host,
            port,
            data: comandaBuffer,
            timeoutMs: 3000,
          });

          if (result.success) {
            return { success: true, originalPrinter: kitchenPrinter.name };
          }

          // Falló la conexión TCP -> Activar Failover
          return await this.executeFailover(
            kitchenPrinter,
            data,
            comandaBuffer,
            result.error || "Falla de comunicación con la impresora de cocina",
          );
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          return await this.executeFailover(kitchenPrinter, data, comandaBuffer, errMsg);
        }
      }
    }

    // Si la impresora de cocina es USB / Windows
    if (window.printAPI?.printSilent) {
      window.printAPI.printSilent({ deviceName: kitchenPrinter.windowsDeviceName });
      return { success: true, originalPrinter: kitchenPrinter.name };
    }

    window.print();
    return { success: true, originalPrinter: kitchenPrinter.name };
  }

  /**
   * Ejecuta el respaldo mutuo (Failover) hacia la impresora de respaldo o caja
   */
  private async executeFailover(
    failedPrinter: PrinterConfig,
    data: KitchenComandaData,
    comandaBuffer: Uint8Array,
    errorReason: string,
  ): Promise<PrintDispatchResult> {
    const printers = await this.getPrinters();

    // 1. Buscar impresora de respaldo explícita
    let fallbackPrinter: PrinterConfig | undefined;
    if (failedPrinter.fallbackPrinterId) {
      fallbackPrinter = printers.find(
        (p) => p.id === failedPrinter.fallbackPrinterId && p.isActive,
      );
    }

    // 2. Si no hay respaldo explícito, buscar la impresora de caja
    if (!fallbackPrinter) {
      fallbackPrinter = printers.find(
        (p) => p.id !== failedPrinter.id && p.isActive && (p.role === "cashier" || p.role === "both"),
      );
    }

    if (!fallbackPrinter) {
      const errorMsg = `Impresora de cocina no responde (${errorReason}) y no hay impresora de respaldo disponible.`;
      this.notifyFailoverAlert({
        failedPrinterName: failedPrinter.name,
        fallbackPrinterName: "Ninguna",
        error: errorMsg,
        critical: true,
      });
      return { success: false, error: errorMsg };
    }

    // Enviar comanda a la impresora de respaldo
    if (fallbackPrinter.connectionType === "network" && fallbackPrinter.ipAddress) {
      if (window.printAPI?.printNetworkRaw) {
        await window.printAPI.printNetworkRaw({
          host: fallbackPrinter.ipAddress,
          port: fallbackPrinter.port || 9100,
          data: comandaBuffer,
          timeoutMs: 3000,
        });
      }
    } else {
      // Impresora de respaldo es USB / Windows
      this.printToCashierPrinter(data, fallbackPrinter);
    }

    // Notificar en la interfaz de usuario que ocurrió un Failover
    this.notifyFailoverAlert({
      failedPrinterName: failedPrinter.name,
      fallbackPrinterName: fallbackPrinter.name,
      error: errorReason,
      critical: false,
    });

    return {
      success: true,
      redirected: true,
      originalPrinter: failedPrinter.name,
      fallbackPrinter: fallbackPrinter.name,
      error: errorReason,
    };
  }

  /**
   * Envía la comanda a la impresora de caja mediante la API de Electron
   */
  private printToCashierPrinter(data: KitchenComandaData, printer: PrinterConfig) {
    if (window.printAPI?.printSilent) {
      window.printAPI.printSilent({ deviceName: printer.windowsDeviceName });
    } else {
      window.print();
    }
  }

  /**
   * Abre la gaveta de dinero en cobros en efectivo
   */
  async openCashDrawer(cashierPrinter?: PrinterConfig): Promise<void> {
    const printer = cashierPrinter || (await this.getCashierPrinter());
    if (!printer || !printer.openCashDrawer) return;

    if (window.printAPI?.openCashDrawer) {
      await window.printAPI.openCashDrawer({
        host: printer.ipAddress,
        port: printer.port,
        deviceName: printer.windowsDeviceName,
      });
    }
  }

  /**
   * Emite un evento global para que la UI muestre advertencia de respaldo (failover)
   */
  private notifyFailoverAlert(detail: {
    failedPrinterName: string;
    fallbackPrinterName: string;
    error: string;
    critical?: boolean;
  }) {
    window.dispatchEvent(
      new CustomEvent("appfactura:printer-failover", {
        detail,
      }),
    );
  }
}

export const printerDispatcherService = new PrinterDispatcherService();
