import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { ESCPOS_DRAWER_KICK, type NetworkPrintResult } from "./printerNetwork";

export interface PrintHtmlRequest {
  html: string;
  deviceName?: string;
}

export interface UsbPrinterRequest {
  deviceName: string;
  timeoutMs: number;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSafePrinterDeviceName(
  value: unknown,
): string | undefined | null {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 260 || /[\r\n\0]/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function parsePrintHtmlRequest(input: unknown): PrintHtmlRequest | null {
  if (!isPlainRecord(input)) {
    return null;
  }
  if (typeof input.html !== "string") {
    return null;
  }
  const trimmedHtml = input.html.trim();
  if (!trimmedHtml || trimmedHtml.length > 200_000) {
    return null;
  }
  const parsedDevice = parseSafePrinterDeviceName(input.deviceName);
  if (parsedDevice === null) {
    return null;
  }
  return {
    html: input.html,
    deviceName: parsedDevice,
  };
}

export function parseUsbPrinterRequest(
  input: unknown,
): UsbPrinterRequest | null {
  if (!isPlainRecord(input)) {
    return null;
  }
  const parsedDevice = parseSafePrinterDeviceName(input.deviceName);
  if (!parsedDevice) {
    return null;
  }
  const rawTimeout = input.timeoutMs;
  const timeoutMs =
    typeof rawTimeout === "number" && Number.isFinite(rawTimeout)
      ? Math.min(15_000, Math.max(500, Math.trunc(rawTimeout)))
      : 4000;
  return {
    deviceName: parsedDevice,
    timeoutMs,
  };
}

const WINDOWS_RAW_SPOOLER_PS = `
$ErrorActionPreference = 'Stop'
$printerName = $env:POS_PRINTER_NAME
$payloadB64 = $env:POS_RAW_BASE64
if ([string]::IsNullOrWhiteSpace($printerName)) {
  throw 'Nombre de impresora Windows vacio.'
}
if ([string]::IsNullOrWhiteSpace($payloadB64)) {
  throw 'Payload RAW vacio.'
}
$bytes = [Convert]::FromBase64String($payloadB64)
$source = @"
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace PosWin32 {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public class DOCINFOW {
    [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
    [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
    [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
  }

  public static class RawPrinterHelper {
    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterW", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool OpenPrinter(string src, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterW", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern int StartDocPrinter(IntPtr hPrinter, int level, [In] DOCINFOW di);

    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

    public static void SendBytesToPrinter(string printerName, byte[] bytes) {
      IntPtr hPrinter = IntPtr.Zero;
      IntPtr pUnmanagedBytes = IntPtr.Zero;
      bool startedDoc = false;
      bool startedPage = false;
      try {
        if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero) || hPrinter == IntPtr.Zero) {
          throw new Win32Exception(Marshal.GetLastWin32Error());
        }
        DOCINFOW di = new DOCINFOW { pDocName = "POS RAW ESC/POS", pDataType = "RAW" };
        if (StartDocPrinter(hPrinter, 1, di) <= 0) {
          throw new Win32Exception(Marshal.GetLastWin32Error());
        }
        startedDoc = true;
        if (!StartPagePrinter(hPrinter)) {
          throw new Win32Exception(Marshal.GetLastWin32Error());
        }
        startedPage = true;
        pUnmanagedBytes = Marshal.AllocHGlobal(bytes.Length);
        Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);
        int written = 0;
        if (!WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out written) || written != bytes.Length) {
          throw new Win32Exception(Marshal.GetLastWin32Error());
        }
      } finally {
        if (pUnmanagedBytes != IntPtr.Zero) Marshal.FreeHGlobal(pUnmanagedBytes);
        if (startedPage) EndPagePrinter(hPrinter);
        if (startedDoc) EndDocPrinter(hPrinter);
        if (hPrinter != IntPtr.Zero) ClosePrinter(hPrinter);
      }
    }
  }
}
"@
$helperDll = $env:POS_RAW_HELPER_DLL
if ([System.IO.File]::Exists($helperDll)) {
  Add-Type -Path $helperDll
} else {
  Add-Type -TypeDefinition $source -OutputAssembly $helperDll
}
[PosWin32.RawPrinterHelper]::SendBytesToPrinter($printerName, $bytes)
`;

const rawHelperDll = path.join(
  tmpdir(),
  `pizza-to-go-raw-spooler-${process.pid}-${createHash("sha256").update(WINDOWS_RAW_SPOOLER_PS).digest("hex").slice(0, 16)}.dll`,
);
let rawPrintTail: Promise<void> = Promise.resolve();

export function printWindowsRaw(
  deviceName: string,
  data: Buffer | Uint8Array | string | number[],
  timeoutMs = 4000,
): Promise<NetworkPrintResult> {
  if (process.platform !== "win32") {
    return Promise.resolve({
      success: false,
      error: "La apertura/impresión RAW USB solo está soportada en Windows.",
    });
  }

  const bufferData =
    typeof data === "string"
      ? Buffer.from(data, "binary")
      : Buffer.from(data);
  if (bufferData.length === 0) {
    return Promise.resolve({
      success: false,
      error: "No hay datos RAW para enviar a la impresora USB.",
    });
  }

  const task = rawPrintTail.then(() => new Promise<NetworkPrintResult>((resolve) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_RAW_SPOOLER_PS],
      {
        env: {
          ...process.env,
          POS_PRINTER_NAME: deviceName,
          POS_RAW_BASE64: bufferData.toString("base64"),
          POS_RAW_HELPER_DLL: rawHelperDll,
        },
        timeout: fs.existsSync(rawHelperDll) ? timeoutMs : Math.max(timeoutMs, 10_000),
        windowsHide: true,
      },
      (err, _stdout, stderr) => {
        if (!err) {
          resolve({ success: true });
          return;
        }
        const detail = stderr?.trim() || err.message || String(err);
        resolve({
          success: false,
          error: `Error enviando pulso RAW a "${deviceName}": ${detail}`,
        });
      },
    );
  }));
  rawPrintTail = task.then(() => undefined, () => undefined);
  return task;
}

export function openDrawerViaWindowsUsb(
  deviceName: string,
  timeoutMs = 4000,
): Promise<NetworkPrintResult> {
  return printWindowsRaw(deviceName, ESCPOS_DRAWER_KICK, timeoutMs);
}
