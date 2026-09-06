import type {
  ReceiptPrinter,
  ReceiptPrintOptions,
} from "./receiptPrinter";

interface PrintRuntime {
  printAPI?: {
    printSilent(options?: { deviceName?: string }): unknown;
  };
  print(): void;
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
        runtime.printAPI.printSilent(
          deviceName ? { deviceName } : undefined,
        );
        if (settleDelayMs > 0) {
          await wait(settleDelayMs);
        }
        return;
      }

      runtime.print();
    },
  };
}

export const receiptPrinter = createRuntimeReceiptPrinter();
