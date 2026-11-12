import type {
  ReceiptPrinter,
  ReceiptPrintOptions,
} from "./receiptPrinter";

interface PrintRuntime {
  printAPI?: {
    printSilent(options?: { deviceName?: string }): Promise<{
      success: boolean;
      error?: string;
    }>;
  };
  print(): void;
  confirm?(message: string): boolean;
}

const wait = (delayMs: number) =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, delayMs);
  });

export function createRuntimeReceiptPrinter(
  runtime: PrintRuntime = window,
): ReceiptPrinter {
  return {
    async print(options: ReceiptPrintOptions = {}) {
      const {
        renderDelayMs = 0,
        settleDelayMs = 500,
        deviceName,
      } = options;

      if (renderDelayMs > 0) {
        await wait(renderDelayMs);
      }

      if (runtime.printAPI) {
        const result = await runtime.printAPI.printSilent(
          deviceName ? { deviceName } : undefined,
        );
        if (!result.success) {
          throw new Error(result.error || "No fue posible imprimir el comprobante.");
        }
        if (settleDelayMs > 0) {
          await wait(settleDelayMs);
        }
        return;
      }

      runtime.print();
      const wasPrinted = runtime.confirm?.(
        "¿El comprobante se imprimió correctamente? Aceptar enviará el pedido a cocina.",
      );
      if (wasPrinted === false) {
        throw new Error(
          "Impresión cancelada. El pedido no fue enviado a cocina; puedes reintentar la impresión.",
        );
      }
    },
  };
}

export const receiptPrinter = createRuntimeReceiptPrinter();
