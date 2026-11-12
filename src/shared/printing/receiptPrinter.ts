export interface ReceiptPrintOptions {
  renderDelayMs?: number;
  settleDelayMs?: number;
  deviceName?: string;
}

export interface ReceiptPrinter {
  print(options?: ReceiptPrintOptions): Promise<void>;
}
