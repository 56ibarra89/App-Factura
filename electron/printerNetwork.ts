import net from "node:net";

export interface NetworkPrinterTestResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
}

export interface NetworkPrintResult {
  success: boolean;
  error?: string;
}

/**
 * Realiza un ping TCP rápido (3s timeout por defecto) para comprobar
 * si la impresora térmica de red está encendida y escuchando en el puerto 9100.
 */
export function testNetworkPrinter(
  host: string,
  port = 9100,
  timeoutMs = 3000,
): Promise<NetworkPrinterTestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      if (settled) return;
      settled = true;
      const latencyMs = Date.now() - startTime;
      cleanup();
      resolve({ success: true, latencyMs });
    });

    socket.on("timeout", () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        success: false,
        error: `Tiempo de espera agotado (${timeoutMs}ms) conectando a ${host}:${port}`,
      });
    });

    socket.on("error", (err: NodeJS.ErrnoException) => {
      if (settled) return;
      settled = true;
      cleanup();
      let errorMsg = err.message;
      if (err.code === "ECONNREFUSED") {
        errorMsg = `Conexión rechazada en ${host}:${port} (¿Impresora encendida o puerto incorrecto?)`;
      } else if (err.code === "EHOSTUNREACH") {
        errorMsg = `Host inalcanzable ${host} (Verifica cable de red o Wi-Fi)`;
      } else if (err.code === "ETIMEDOUT") {
        errorMsg = `Timeout de conexión con ${host}:${port}`;
      }
      resolve({ success: false, error: errorMsg });
    });

    try {
      socket.connect(port, host);
    } catch (err: unknown) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

/**
 * Envía datos binarios RAW (ESC/POS) directamente a la impresora mediante Socket TCP al puerto 9100.
 */
export function printNetworkRaw(
  host: string,
  port = 9100,
  data: Buffer | Uint8Array | string | number[],
  timeoutMs = 3000,
): Promise<NetworkPrintResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);

    const bufferData =
      typeof data === "string"
        ? Buffer.from(data, "binary")
        : Buffer.isBuffer(data)
          ? data
          : Array.isArray(data)
            ? Buffer.from(data)
            : Buffer.from(data);

    socket.on("connect", () => {
      socket.write(bufferData, (err) => {
        if (err) {
          if (!settled) {
            settled = true;
            cleanup();
            resolve({ success: false, error: `Error enviando datos: ${err.message}` });
          }
          return;
        }

        // Finalizar la conexión para asegurar que la impresora libere el buffer
        socket.end(() => {
          if (!settled) {
            settled = true;
            cleanup();
            resolve({ success: true });
          }
        });
      });
    });

    socket.on("timeout", () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        success: false,
        error: `Timeout de socket (${timeoutMs}ms) al enviar datos a ${host}:${port}`,
      });
    });

    socket.on("error", (err: NodeJS.ErrnoException) => {
      if (settled) return;
      settled = true;
      cleanup();
      let errorMsg = err.message;
      if (err.code === "ECONNREFUSED") {
        errorMsg = `Conexión rechazada en ${host}:${port}`;
      } else if (err.code === "EHOSTUNREACH") {
        errorMsg = `Impresora no alcanzable en ${host}:${port}`;
      } else if (err.code === "ETIMEDOUT") {
        errorMsg = `Tiempo de conexión agotado con ${host}:${port}`;
      }
      resolve({ success: false, error: errorMsg });
    });

    try {
      socket.connect(port, host);
    } catch (err: unknown) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

/**
 * Pulso estándar ESC/POS para abrir gaveta de dinero conectada por puerto RJ11.
 * Pin 2: ESC p 0 25 250 (\x1B\x70\x00\x19\xFA)
 * Pin 5: ESC p 1 25 250 (\x1B\x70\x01\x19\xFA)
 */
export const ESCPOS_DRAWER_KICK = Buffer.from([
  0x1b, 0x70, 0x00, 0x19, 0xfa,
  0x1b, 0x70, 0x01, 0x19, 0xfa,
]);

export function openDrawerViaNetwork(
  host: string,
  port = 9100,
  timeoutMs = 3000,
): Promise<NetworkPrintResult> {
  return printNetworkRaw(host, port, ESCPOS_DRAWER_KICK, timeoutMs);
}
