import { deviceGateway } from "../api/deviceGateway";
import type { PrinterConfig } from "../api/printerConfig.types";
import { EscPosBuilder } from "../../../shared/printing/escposBuilder";
import {
  KITCHEN_MODIFIER_PREFIXES,
  type KitchenModifierSelection,
} from "../../settings";

export interface KitchenOrderItem {
  name: string;
  quantity: number;
  size?: string;
  note?: string;
  kitchenModifiers?: KitchenModifierSelection[];
  extras?: Array<{ name: string }>;
  isCombo?: boolean;
  comboSelections?: Array<{
    productName: string;
    quantity: number;
    size?: string;
    extraPrice?: number;
    categoryName?: string;
    kitchenId?: string;
    extras?: Array<{ name: string }>;
  }>;
}

export interface KitchenComandaData {
  jobId?: string;
  orderId?: string;
  tableNumber?: string | number;
  orderType?: string;
  waiterOrCashier?: string;
  items: KitchenOrderItem[];
  timestamp?: number | string | Date;
}

export type PrintDispatchStatus =
  | "printed"
  | "skipped"
  | "pending"
  | "failed";

export interface PrintDispatchResult {
  success: boolean;
  status?: PrintDispatchStatus;
  jobId?: string;
  redirected?: boolean;
  originalPrinter?: string;
  fallbackPrinter?: string;
  error?: string;
}

class PrinterDispatcherService {
  private cachedPrinters: PrinterConfig[] | null = null;
  private lastFetchTime = 0;
  private readonly printedJobIds = new Set<string>();
  private readonly pendingJobs = new Map<string, KitchenComandaData>();

  private deriveJobId(data: KitchenComandaData): string {
    if (data.jobId && data.jobId.trim()) {
      return data.jobId.trim();
    }
    const ts =
      data.timestamp !== undefined
        ? new Date(data.timestamp).getTime()
        : Date.now();
    const itemSummary = (data.items || [])
      .map((item) => `${item.quantity}x${item.name}:${item.size || ""}`)
      .join("|");
    return `${data.orderId || "no-order"}:${ts}:${itemSummary}`;
  }

  getPendingJobs(): KitchenComandaData[] {
    return Array.from(this.pendingJobs.values());
  }

  async retryPendingComanda(jobId: string): Promise<PrintDispatchResult> {
    const pending = this.pendingJobs.get(jobId);
    if (!pending) {
      return {
        success: false,
        status: "skipped",
        jobId,
        error: "No existe una comanda pendiente con el identificador indicado.",
      };
    }
    return await this.printKitchenComanda(pending);
  }

  /**
   * Obtiene la configuración de impresoras con caché de corta duración (5s)
   */
  async getPrinters(forceRefresh = false): Promise<PrinterConfig[]> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedPrinters &&
      now - this.lastFetchTime < 5000
    ) {
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
      return await window.printAPI.testNetworkPrinter({
        host,
        port,
        timeoutMs: 3000,
      });
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
        return {
          success: false,
          status: "failed",
          error: "La impresora no tiene dirección IP configurada.",
        };
      }
      if (!window.printAPI?.printNetworkTicket) {
        return {
          success: false,
          status: "failed",
          error: "La impresión de tickets por red no está disponible en Electron.",
        };
      }

      const res = await window.printAPI.printNetworkTicket({
        host: printer.ipAddress,
        port: printer.port || 9100,
        data: builder.toBytes(),
        timeoutMs: 3000,
      });

      return {
        ...res,
        status: res.success ? "printed" : "failed",
      };
    }

    // Impresión por Windows / USB
    if (window.printAPI?.printSilent) {
      const result = await window.printAPI.printSilent({
        deviceName: printer.windowsDeviceName,
      });
      if (!result.success) {
        return { success: false, status: "failed", error: result.error };
      }
      return { success: true, status: "printed" };
    }

    window.print();
    return { success: true, status: "printed" };
  }

  /**
   * Construye el buffer binario ESC/POS para comanda de cocina
   */
  private buildKitchenComandaBuffer(data: KitchenComandaData): Uint8Array {
    const builder = new EscPosBuilder();
    const dateStr = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

    builder
      .align("center")
      .size("double-height")
      .bold(true)
      .line("=== ORDEN COCINA ===")
      .size("large");

    if (
      data.tableNumber !== undefined &&
      data.tableNumber !== null &&
      data.tableNumber !== ""
    ) {
      builder.line(`MESA: ${data.tableNumber}`);
    } else {
      builder.line(`${(data.orderType || "PARA LLEVAR").toUpperCase()}`);
    }

    builder.size("normal").bold(false).align("left").separator("-");

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
      builder.line(
        `[ ${item.quantity} ] ${item.name.toUpperCase()}${sizeText}`,
      );

      builder.size("normal").bold(false);

      if (item.comboSelections && item.comboSelections.length > 0) {
        item.comboSelections.forEach((sel) => {
          const selSize =
            sel.size && sel.size !== "único" ? ` (${sel.size})` : "";
          const catTag = sel.categoryName
            ? ` [${sel.categoryName.toUpperCase()}]`
            : "";
          builder.line(
            `   > ${sel.quantity}x ${sel.productName.toUpperCase()}${selSize}${catTag}`,
          );
          sel.extras?.forEach((extra) => {
            builder.line(`      + ${extra.name.toUpperCase()}`);
          });
        });
      }

      if (item.extras && item.extras.length > 0) {
        item.extras.forEach((extra) => {
          builder.line(`   + Extra: ${extra.name}`);
        });
      }

      if (item.kitchenModifiers && item.kitchenModifiers.length > 0) {
        builder.bold(true);
        item.kitchenModifiers.forEach((modifier) => {
          builder.line(
            `   ${KITCHEN_MODIFIER_PREFIXES[modifier.kind]} ${modifier.label.toUpperCase()}`,
          );
        });
        builder.bold(false);
      }

      if (item.note) {
        builder.bold(true);
        builder.line(`   ! NOTA LIBRE: ${item.note}`);
        builder.bold(false);
      }
      builder.feed(1);
    });

    builder.separator("=").feed(2).cut();

    return builder.toBytes();
  }

  /**
   * Despacha una comanda a la impresora de cocina con soporte de FAILOVER / RESPALDO automático
   */
  async printKitchenComanda(
    data: KitchenComandaData,
  ): Promise<PrintDispatchResult> {
    if (!data.items || data.items.length === 0) {
      return { success: true, status: "skipped" };
    }

    const jobId = this.deriveJobId(data);
    if (this.printedJobIds.has(jobId)) {
      return {
        success: true,
        status: "skipped",
        jobId,
        originalPrinter: "Ya impreso",
      };
    }

    const kitchenPrinter = await this.getKitchenPrinter();

    // Si no hay impresora de cocina configurada, registrar como omitida/pendiente sin informar falso éxito de impresión
    if (!kitchenPrinter) {
      this.pendingJobs.set(jobId, { ...data, jobId });
      return {
        success: false,
        status: "skipped",
        jobId,
        originalPrinter: "Ninguna (No configurada)",
        error: "No hay impresora de cocina activa configurada.",
      };
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
          jobId,
        );
      }

      if (!window.printAPI?.printNetworkTicket) {
        return await this.executeFailover(
          kitchenPrinter,
          data,
          comandaBuffer,
          "La API de impresión por red de Electron no está disponible",
          jobId,
        );
      }

      try {
        const result = await window.printAPI.printNetworkTicket({
          host,
          port,
          data: comandaBuffer,
          timeoutMs: 3000,
        });

        if (result.success) {
          this.printedJobIds.add(jobId);
          this.pendingJobs.delete(jobId);
          return {
            success: true,
            status: "printed",
            jobId,
            originalPrinter: kitchenPrinter.name,
          };
        }

        // Falló la conexión TCP -> Activar Failover
        return await this.executeFailover(
          kitchenPrinter,
          data,
          comandaBuffer,
          result.error || "Falla de comunicación con la impresora de cocina",
          jobId,
        );
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        return await this.executeFailover(
          kitchenPrinter,
          data,
          comandaBuffer,
          errMsg,
          jobId,
        );
      }
    }

    // Si la impresora de cocina es USB / Windows, no invocar printSilent para no imprimir el DOM visible;
    // intentar Failover hacia una impresora de respaldo en red y, si no es posible, informar que se omitió.
    const usbSkipReason = `Impresión directa de comanda en impresora USB/Windows (${kitchenPrinter.windowsDeviceName || kitchenPrinter.name}) requiere conexión de red RAW 9100. Se omite para no imprimir la interfaz gráfica.`;
    console.warn(`[PrinterDispatcher] ${usbSkipReason}`);
    return await this.executeFailover(
      kitchenPrinter,
      data,
      comandaBuffer,
      usbSkipReason,
      jobId,
    );
  }

  /**
   * Ejecuta el respaldo mutuo (Failover) hacia la impresora de respaldo o caja
   */
  private async executeFailover(
    failedPrinter: PrinterConfig,
    data: KitchenComandaData,
    comandaBuffer: Uint8Array,
    errorReason: string,
    jobId = this.deriveJobId(data),
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
        (p) =>
          p.id !== failedPrinter.id &&
          p.isActive &&
          (p.role === "cashier" || p.role === "both"),
      );
    }

    if (!fallbackPrinter) {
      const errorMsg = `Impresora de cocina no responde (${errorReason}) y no hay impresora de respaldo disponible.`;
      this.pendingJobs.set(jobId, { ...data, jobId });
      this.notifyFailoverAlert({
        failedPrinterName: failedPrinter.name,
        fallbackPrinterName: "Ninguna",
        error: errorMsg,
        critical: true,
      });
      return {
        success: false,
        status: "failed",
        jobId,
        originalPrinter: failedPrinter.name,
        error: errorMsg,
      };
    }

    // Enviar comanda a la impresora de respaldo
    if (
      fallbackPrinter.connectionType === "network" &&
      fallbackPrinter.ipAddress
    ) {
      if (!window.printAPI?.printNetworkTicket) {
        const noApiError = `Impresora principal (${failedPrinter.name}) falló (${errorReason}) y la API de red de Electron no está disponible para la impresora de respaldo (${fallbackPrinter.name}).`;
        this.pendingJobs.set(jobId, { ...data, jobId });
        this.notifyFailoverAlert({
          failedPrinterName: failedPrinter.name,
          fallbackPrinterName: fallbackPrinter.name,
          error: noApiError,
          critical: true,
        });
        return {
          success: false,
          status: "failed",
          jobId,
          redirected: false,
          originalPrinter: failedPrinter.name,
          fallbackPrinter: fallbackPrinter.name,
          error: noApiError,
        };
      }

      try {
        const fallbackResult = await window.printAPI.printNetworkTicket({
          host: fallbackPrinter.ipAddress,
          port: fallbackPrinter.port || 9100,
          data: comandaBuffer,
          timeoutMs: 3000,
        });

        if (!fallbackResult.success) {
          const fallbackErr =
            fallbackResult.error ||
            "La impresora de respaldo tampoco respondió";
          const combinedError = `Impresora principal (${failedPrinter.name}) falló (${errorReason}) y respaldo (${fallbackPrinter.name}) también falló (${fallbackErr}).`;
          this.pendingJobs.set(jobId, { ...data, jobId });
          this.notifyFailoverAlert({
            failedPrinterName: failedPrinter.name,
            fallbackPrinterName: fallbackPrinter.name,
            error: combinedError,
            critical: true,
          });
          return {
            success: false,
            status: "failed",
            jobId,
            redirected: false,
            originalPrinter: failedPrinter.name,
            fallbackPrinter: fallbackPrinter.name,
            error: combinedError,
          };
        }
      } catch (err: unknown) {
        const fallbackErr = err instanceof Error ? err.message : String(err);
        const combinedError = `Impresora principal (${failedPrinter.name}) falló (${errorReason}) y respaldo (${fallbackPrinter.name}) lanzó error (${fallbackErr}).`;
        this.pendingJobs.set(jobId, { ...data, jobId });
        this.notifyFailoverAlert({
          failedPrinterName: failedPrinter.name,
          fallbackPrinterName: fallbackPrinter.name,
          error: combinedError,
          critical: true,
        });
        return {
          success: false,
          status: "failed",
          jobId,
          redirected: false,
          originalPrinter: failedPrinter.name,
          fallbackPrinter: fallbackPrinter.name,
          error: combinedError,
        };
      }

      // Éxito verificado en la impresora de respaldo por red
      this.printedJobIds.add(jobId);
      this.pendingJobs.delete(jobId);
      this.notifyFailoverAlert({
        failedPrinterName: failedPrinter.name,
        fallbackPrinterName: fallbackPrinter.name,
        error: errorReason,
        critical: false,
      });

      return {
        success: true,
        status: "printed",
        jobId,
        redirected: true,
        originalPrinter: failedPrinter.name,
        fallbackPrinter: fallbackPrinter.name,
        error: errorReason,
      };
    }

    // Impresora de respaldo es USB / Windows (sin soporte RAW ESC/POS)
    const usbResult = this.printToCashierPrinter(data, fallbackPrinter);
    const combinedUsbError = `Impresora principal (${failedPrinter.name}) falló (${errorReason}) y respaldo (${fallbackPrinter.name}) no soporta comanda RAW (${usbResult.error}).`;
    this.pendingJobs.set(jobId, { ...data, jobId });
    this.notifyFailoverAlert({
      failedPrinterName: failedPrinter.name,
      fallbackPrinterName: fallbackPrinter.name,
      error: combinedUsbError,
      critical: true,
    });

    return {
      success: false,
      status: usbResult.status ?? "skipped",
      jobId,
      redirected: false,
      originalPrinter: failedPrinter.name,
      fallbackPrinter: fallbackPrinter.name,
      error: combinedUsbError,
    };
  }

  /**
   * Envía la comanda a la impresora de caja mediante la API de Electron
   */
  private printToCashierPrinter(
    _data: KitchenComandaData,
    printer: PrinterConfig,
  ): PrintDispatchResult {
    const error = `Omitiendo impresión de comanda en impresora ${printer.name}: se evita captura de pantalla (printSilent) al no disponer de conexión RAW o plantilla DOM.`;
    console.warn(`[PrinterDispatcher] ${error}`);
    return {
      success: false,
      status: "skipped",
      originalPrinter: printer.name,
      error,
    };
  }

  /**
   * Abre la gaveta de dinero en cobros en efectivo
   */
  async openCashDrawer(cashierPrinter?: PrinterConfig): Promise<void> {
    const printer = cashierPrinter || (await this.getCashierPrinter());
    if (!printer || !printer.openCashDrawer) return;

    if (
      printer.connectionType === "network" &&
      printer.ipAddress &&
      window.printAPI?.openNetworkCashDrawer
    ) {
      await window.printAPI.openNetworkCashDrawer({
        host: printer.ipAddress,
        port: printer.port,
        timeoutMs: 3000,
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
