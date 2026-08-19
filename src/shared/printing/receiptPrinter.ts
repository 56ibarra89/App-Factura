export interface ReceiptPrintOptions {

  renderDelayMs?: number;

  settleDelayMs?: number;
}

export interface ReceiptPrinter {
  print(options?: ReceiptPrintOptions): Promise<void>;
}

