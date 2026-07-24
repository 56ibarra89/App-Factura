export interface ReceiptPrintOptions {
  /**
   * Gives React time to render the printable receipt before dispatching the
   * print command.
   */
  renderDelayMs?: number;
  /**
   * Keeps the printable UI mounted while Electron captures the document.
   */
  settleDelayMs?: number;
}

export interface ReceiptPrinter {
  print(options?: ReceiptPrintOptions): Promise<void>;
}
