import type {
  ReceiptPrinter,
  ReceiptPrintOptions,
} from "./receiptPrinter";

interface PrintRuntime {
  ipcRenderer?: {
    send(channel: string): unknown;
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
      } = options;

      if (renderDelayMs > 0) {
        await wait(renderDelayMs);
      }

      if (runtime.ipcRenderer) {
        runtime.ipcRenderer.send("print-silent");
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
