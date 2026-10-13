import { isIP } from "node:net";

const DEFAULT_PRINTER_PORT = 9100;
const DEFAULT_TIMEOUT_MS = 3000;
const MIN_TIMEOUT_MS = 500;
const MAX_TIMEOUT_MS = 10_000;
const MAX_PRINT_PAYLOAD_BYTES = 256 * 1024;

export interface ValidatedPrinterTarget {
  host: string;
  port: number;
  timeoutMs: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrivateIpv4(host: string): boolean {
  if (isIP(host) !== 4) return false;

  const [first, second] = host.split(".").map(Number);
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isAllowedRawPrinterPort(port: number): boolean {
  return Number.isInteger(port) && port >= 9100 && port <= 9109;
}

export function validatePrinterTarget(
  value: unknown,
): ValidatedPrinterTarget | null {
  if (!isRecord(value) || typeof value.host !== "string") return null;

  const host = value.host.trim();
  const port = value.port === undefined ? DEFAULT_PRINTER_PORT : value.port;
  const timeoutMs =
    value.timeoutMs === undefined ? DEFAULT_TIMEOUT_MS : value.timeoutMs;

  if (!isPrivateIpv4(host)) return null;
  if (typeof port !== "number" || !isAllowedRawPrinterPort(port)) return null;
  if (
    typeof timeoutMs !== "number" ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs < MIN_TIMEOUT_MS ||
    timeoutMs > MAX_TIMEOUT_MS
  ) {
    return null;
  }

  return { host, port, timeoutMs };
}

export function validatePrintPayload(value: unknown): Buffer | null {
  let payload: Buffer;

  if (Array.isArray(value)) {
    if (
      !value.every(
        (byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255,
      )
    ) {
      return null;
    }
    payload = Buffer.from(value);
  } else if (value instanceof Uint8Array) {
    payload = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  } else {
    return null;
  }

  if (payload.byteLength === 0 || payload.byteLength > MAX_PRINT_PAYLOAD_BYTES) {
    return null;
  }

  return payload;
}

export function validateDeviceName(value: unknown): string | undefined | null {
  if (value === undefined) return undefined;
  if (!isRecord(value) || value.deviceName === undefined) return null;
  if (typeof value.deviceName !== "string") return null;

  const deviceName = value.deviceName.trim();
  if (deviceName.length === 0 || deviceName.length > 256) return null;
  return deviceName;
}

export function configuredApiOrigin(apiUrl: string | undefined): string | null {
  if (!apiUrl) return null;
  try {
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}
