import { app, BrowserWindow, ipcMain, safeStorage, session } from "electron";
import * as fs from "node:fs";
import fs__default from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import path__default from "node:path";
import net, { isIP } from "node:net";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
function testNetworkPrinter(host, port = 9100, timeoutMs = 3e3) {
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
        error: `Tiempo de espera agotado (${timeoutMs}ms) conectando a ${host}:${port}`
      });
    });
    socket.on("error", (err) => {
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
    } catch (err) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });
}
function printNetworkRaw(host, port = 9100, data, timeoutMs = 3e3) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };
    socket.setTimeout(timeoutMs);
    const bufferData = typeof data === "string" ? Buffer.from(data, "binary") : Buffer.isBuffer(data) ? data : Array.isArray(data) ? Buffer.from(data) : Buffer.from(data);
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
        error: `Timeout de socket (${timeoutMs}ms) al enviar datos a ${host}:${port}`
      });
    });
    socket.on("error", (err) => {
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
    } catch (err) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        success: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  });
}
const ESCPOS_DRAWER_KICK = Buffer.from([
  27,
  112,
  0,
  25,
  250,
  27,
  112,
  1,
  25,
  250
]);
function openDrawerViaNetwork(host, port = 9100, timeoutMs = 3e3) {
  return printNetworkRaw(host, port, ESCPOS_DRAWER_KICK, timeoutMs);
}
function isPlainRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseSafePrinterDeviceName(value) {
  if (value === void 0 || value === null || value === "") {
    return void 0;
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
function parsePrintHtmlRequest(input) {
  if (!isPlainRecord(input)) {
    return null;
  }
  if (typeof input.html !== "string") {
    return null;
  }
  const trimmedHtml = input.html.trim();
  if (!trimmedHtml || trimmedHtml.length > 2e5) {
    return null;
  }
  const parsedDevice = parseSafePrinterDeviceName(input.deviceName);
  if (parsedDevice === null) {
    return null;
  }
  return {
    html: input.html,
    deviceName: parsedDevice
  };
}
function parseUsbPrinterRequest(input) {
  if (!isPlainRecord(input)) {
    return null;
  }
  const parsedDevice = parseSafePrinterDeviceName(input.deviceName);
  if (!parsedDevice) {
    return null;
  }
  const rawTimeout = input.timeoutMs;
  const timeoutMs = typeof rawTimeout === "number" && Number.isFinite(rawTimeout) ? Math.min(15e3, Math.max(500, Math.trunc(rawTimeout))) : 4e3;
  return {
    deviceName: parsedDevice,
    timeoutMs
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
  `pizza-to-go-raw-spooler-${process.pid}-${createHash("sha256").update(WINDOWS_RAW_SPOOLER_PS).digest("hex").slice(0, 16)}.dll`
);
let rawPrintTail = Promise.resolve();
function printWindowsRaw(deviceName, data, timeoutMs = 4e3) {
  if (process.platform !== "win32") {
    return Promise.resolve({
      success: false,
      error: "La apertura/impresión RAW USB solo está soportada en Windows."
    });
  }
  const bufferData = typeof data === "string" ? Buffer.from(data, "binary") : Buffer.from(data);
  if (bufferData.length === 0) {
    return Promise.resolve({
      success: false,
      error: "No hay datos RAW para enviar a la impresora USB."
    });
  }
  const task = rawPrintTail.then(() => new Promise((resolve) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_RAW_SPOOLER_PS],
      {
        env: {
          ...process.env,
          POS_PRINTER_NAME: deviceName,
          POS_RAW_BASE64: bufferData.toString("base64"),
          POS_RAW_HELPER_DLL: rawHelperDll
        },
        timeout: fs.existsSync(rawHelperDll) ? timeoutMs : Math.max(timeoutMs, 1e4),
        windowsHide: true
      },
      (err, _stdout, stderr) => {
        if (!err) {
          resolve({ success: true });
          return;
        }
        const detail = (stderr == null ? void 0 : stderr.trim()) || err.message || String(err);
        resolve({
          success: false,
          error: `Error enviando pulso RAW a "${deviceName}": ${detail}`
        });
      }
    );
  }));
  rawPrintTail = task.then(() => void 0, () => void 0);
  return task;
}
function openDrawerViaWindowsUsb(deviceName, timeoutMs = 4e3) {
  return printWindowsRaw(deviceName, ESCPOS_DRAWER_KICK, timeoutMs);
}
const DEFAULT_PRINTER_PORT = 9100;
const DEFAULT_TIMEOUT_MS = 3e3;
const MIN_TIMEOUT_MS = 500;
const MAX_TIMEOUT_MS = 1e4;
const MAX_PRINT_PAYLOAD_BYTES = 256 * 1024;
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isPrivateIpv4(host) {
  if (isIP(host) !== 4) return false;
  const [first, second] = host.split(".").map(Number);
  return first === 10 || first === 172 && second >= 16 && second <= 31 || first === 192 && second === 168;
}
function isAllowedRawPrinterPort(port) {
  return Number.isInteger(port) && port >= 9100 && port <= 9109;
}
function validatePrinterTarget(value) {
  if (!isRecord(value) || typeof value.host !== "string") return null;
  const host = value.host.trim();
  const port = value.port === void 0 ? DEFAULT_PRINTER_PORT : value.port;
  const timeoutMs = value.timeoutMs === void 0 ? DEFAULT_TIMEOUT_MS : value.timeoutMs;
  if (!isPrivateIpv4(host)) return null;
  if (typeof port !== "number" || !isAllowedRawPrinterPort(port)) return null;
  if (typeof timeoutMs !== "number" || !Number.isInteger(timeoutMs) || timeoutMs < MIN_TIMEOUT_MS || timeoutMs > MAX_TIMEOUT_MS) {
    return null;
  }
  return { host, port, timeoutMs };
}
function validatePrintPayload(value) {
  let payload;
  if (Array.isArray(value)) {
    if (!value.every(
      (byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255
    )) {
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
function validateDeviceName(value) {
  if (value === void 0) return void 0;
  if (!isRecord(value)) return null;
  if (value.deviceName === void 0) return void 0;
  if (typeof value.deviceName !== "string") return null;
  const deviceName = value.deviceName.trim();
  if (deviceName.length === 0) return void 0;
  if (deviceName.length > 256) return null;
  return deviceName;
}
function normalizeConfiguredApiBaseUrl(rawUrl) {
  if (typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    return normalizedPath === "" || normalizedPath === "/" ? parsed.origin : `${parsed.origin}${normalizedPath}`;
  } catch {
    return null;
  }
}
function resolveRuntimeApiBaseUrl(options) {
  var _a, _b;
  const fromPosEnv = normalizeConfiguredApiBaseUrl((_a = options.env) == null ? void 0 : _a.POS_API_BASE_URL);
  if (fromPosEnv) return fromPosEnv;
  const fromViteEnv = normalizeConfiguredApiBaseUrl((_b = options.env) == null ? void 0 : _b.VITE_API_BASE_URL);
  if (fromViteEnv) return fromViteEnv;
  if (options.configFileContent) {
    try {
      const parsed = JSON.parse(options.configFileContent);
      if (isRecord(parsed)) {
        const fromConfig = normalizeConfiguredApiBaseUrl(parsed.apiBaseUrl);
        if (fromConfig) return fromConfig;
      }
    } catch {
    }
  }
  return normalizeConfiguredApiBaseUrl(options.builtInUrl);
}
function configuredApiOrigin(apiUrl) {
  if (!apiUrl) return null;
  try {
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}
function buildElectronCspHeader(apiOrigin) {
  const connectSources = ["'self'", "ws://localhost:*", "http://localhost:*"];
  if (apiOrigin) {
    connectSources.push(apiOrigin);
    if (apiOrigin.startsWith("https://")) {
      connectSources.push(apiOrigin.replace("https://", "wss://"));
    } else if (apiOrigin.startsWith("http://")) {
      connectSources.push(apiOrigin.replace("http://", "ws://"));
    }
  }
  return [
    "default-src 'self'",
    "script-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`
  ].join("; ");
}
const __dirname$1 = path__default.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path__default.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path__default.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path__default.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path__default.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function isTrustedIpcSender(event) {
  return Boolean(
    win && !win.isDestroyed() && event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame
  );
}
function loadRuntimeApiBaseUrl() {
  const configFilePath = path__default.join(app.getPath("userData"), "runtime-config.json");
  let configFileContent = null;
  try {
    if (fs__default.existsSync(configFilePath)) {
      configFileContent = fs__default.readFileSync(configFilePath, "utf8");
    }
  } catch (error) {
    console.warn("[Main] No se pudo leer runtime-config.json:", error);
  }
  return resolveRuntimeApiBaseUrl({
    env: process.env,
    configFileContent,
    builtInUrl: "http://localhost:3000"
  });
}
const deniedIpcResult = {
  success: false,
  error: "Operación nativa no autorizada."
};
function createWindow() {
  win = new BrowserWindow({
    icon: path__default.join(process.env.VITE_PUBLIC || "", "icon.png"),
    webPreferences: {
      preload: path__default.join(__dirname$1, "preload.mjs"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setMenu(null);
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event, navigationUrl) => {
    const currentUrl = win == null ? void 0 : win.webContents.getURL();
    if (!currentUrl) return;
    try {
      if (new URL(navigationUrl).origin !== new URL(currentUrl).origin) {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path__default.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  const runtimeApiBaseUrl = loadRuntimeApiBaseUrl();
  const apiOrigin = configuredApiOrigin(runtimeApiBaseUrl ?? void 0);
  const cspHeaderValue = buildElectronCspHeader(apiOrigin);
  let encryptedToken = null;
  let printSessionProtected = false;
  const canUsePrinterCapabilities = (event) => isTrustedIpcSender(event) && encryptedToken !== null;
  ipcMain.removeAllListeners("config:get-api-base-url-sync");
  ipcMain.on("config:get-api-base-url-sync", (event) => {
    event.returnValue = isTrustedIpcSender(event) ? runtimeApiBaseUrl ?? "" : "";
  });
  ipcMain.removeHandler("config:get-api-base-url");
  ipcMain.handle(
    "config:get-api-base-url",
    (event) => isTrustedIpcSender(event) ? runtimeApiBaseUrl ?? "" : ""
  );
  ipcMain.removeHandler("printer:print-current-page");
  ipcMain.handle("printer:print-current-page", async (event, options) => {
    if (!canUsePrinterCapabilities(event)) return deniedIpcResult;
    const deviceName = validateDeviceName(options);
    if (deviceName === null) {
      return { success: false, error: "Impresora no válida." };
    }
    if (deviceName) {
      const printers = await event.sender.getPrintersAsync();
      if (!printers.some((printer) => printer.name === deviceName)) {
        return { success: false, error: "La impresora indicada no está instalada." };
      }
    }
    if (event.sender.isDestroyed()) {
      return {
        success: false,
        error: "La ventana de impresión se cerró antes de completar la impresión."
      };
    }
    const PRINT_TIMEOUT_MS = 15e3;
    return await new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({
          success: false,
          error: `Tiempo de espera agotado (${PRINT_TIMEOUT_MS}ms) al imprimir.`
        });
      }, PRINT_TIMEOUT_MS);
      try {
        event.sender.print(
          {
            silent: true,
            printBackground: true,
            deviceName: deviceName || "",
            margins: { marginType: "none" }
          },
          (success, failureReason) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(
              success ? { success: true } : { success: false, error: failureReason || "No fue posible imprimir." }
            );
          }
        );
      } catch (err) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({
          success: false,
          error: err instanceof Error ? err.message : "Error inesperado al imprimir."
        });
      }
    });
  });
  ipcMain.removeHandler("printer:list-system");
  ipcMain.handle("printer:list-system", async (event) => {
    if (!canUsePrinterCapabilities(event)) return [];
    try {
      const printers = await event.sender.getPrintersAsync();
      return printers.map(({ name, displayName, description, options }) => {
        const safeOptions = options;
        const rawStatus = safeOptions.status ?? safeOptions["printer-status"];
        const status = Number.isFinite(Number(rawStatus)) ? Number(rawStatus) : 0;
        const rawDefault = safeOptions.isDefault ?? safeOptions["is-default"];
        const isDefault = rawDefault === true || rawDefault === "true";
        return { name, displayName, description, status, isDefault };
      });
    } catch (error) {
      console.error("[Main] Error obteniendo impresoras del sistema:", error);
      return [];
    }
  });
  ipcMain.removeHandler("printer:test-network");
  ipcMain.handle(
    "printer:test-network",
    async (event, options) => {
      if (!canUsePrinterCapabilities(event)) return deniedIpcResult;
      const target = validatePrinterTarget(options);
      if (!target) {
        return {
          success: false,
          error: "Solo se permiten impresoras IPv4 privadas en puertos 9100-9109."
        };
      }
      return await testNetworkPrinter(
        target.host,
        target.port,
        target.timeoutMs
      );
    }
  );
  ipcMain.removeHandler("printer:print-ticket");
  ipcMain.handle(
    "printer:print-ticket",
    async (event, options) => {
      if (!canUsePrinterCapabilities(event)) return deniedIpcResult;
      const target = validatePrinterTarget(options);
      const payload = typeof options === "object" && options !== null && "data" in options ? validatePrintPayload(options.data) : null;
      if (!target || !payload) {
        return { success: false, error: "Destino o contenido de impresión no válido." };
      }
      return await printNetworkRaw(
        target.host,
        target.port,
        payload,
        target.timeoutMs
      );
    }
  );
  ipcMain.removeHandler("printer:open-network-drawer");
  ipcMain.handle(
    "printer:open-network-drawer",
    async (event, options) => {
      if (!canUsePrinterCapabilities(event)) return deniedIpcResult;
      const target = validatePrinterTarget(options);
      if (!target) {
        return { success: false, error: "Destino de gaveta no válido." };
      }
      return await openDrawerViaNetwork(
        target.host,
        target.port,
        target.timeoutMs
      );
    }
  );
  ipcMain.removeHandler("printer:print-html");
  ipcMain.handle("printer:print-html", async (event, payload) => {
    if (!canUsePrinterCapabilities(event)) {
      return { success: false, error: "Origen de IPC no autorizado." };
    }
    const parsed = parsePrintHtmlRequest(payload);
    if (!parsed) {
      return { success: false, error: "Contenido o impresora inválidos para impresión." };
    }
    if (parsed.deviceName) {
      const printers = await event.sender.getPrintersAsync();
      if (!printers.some((printer) => printer.name === parsed.deviceName)) {
        return { success: false, error: "La impresora indicada no está instalada." };
      }
    }
    const PRINT_TIMEOUT_MS = 15e3;
    const printWin = new BrowserWindow({
      show: false,
      width: 420,
      height: 700,
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        javascript: false,
        partition: "ephemeral-print"
      }
    });
    printWin.webContents.on("will-navigate", (navigationEvent) => navigationEvent.preventDefault());
    printWin.webContents.on("will-redirect", (navigationEvent) => navigationEvent.preventDefault());
    printWin.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    if (!printSessionProtected) {
      printWin.webContents.session.webRequest.onBeforeRequest(
        { urls: ["http://*/*", "https://*/*", "ws://*/*", "wss://*/*", "file://*/*"] },
        (_details, callback) => callback({ cancel: true })
      );
      printSessionProtected = true;
    }
    try {
      return await new Promise((resolve) => {
        let settled = false;
        const settle = (result) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(result);
        };
        const timer = setTimeout(() => {
          settle({
            success: false,
            error: `Tiempo de espera agotado (${PRINT_TIMEOUT_MS}ms) al imprimir ticket.`
          });
        }, PRINT_TIMEOUT_MS);
        printWin.webContents.once("did-fail-load", (_e, _errCode, errDesc) => {
          settle({
            success: false,
            error: errDesc || "No se pudo cargar la plantilla de impresión."
          });
        });
        printWin.webContents.once("did-finish-load", () => {
          if (settled || printWin.isDestroyed()) {
            settle({
              success: false,
              error: "La ventana de impresión se cerró antes de completar la impresión."
            });
            return;
          }
          printWin.webContents.print(
            {
              silent: true,
              printBackground: true,
              deviceName: parsed.deviceName || "",
              margins: { marginType: "none" }
            },
            (success, failureReason) => {
              settle(
                success ? { success: true } : { success: false, error: failureReason || "No fue posible imprimir." }
              );
            }
          );
        });
        void printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(parsed.html)}`).catch((err) => {
          settle({
            success: false,
            error: err instanceof Error ? err.message : "Error cargando ticket HTML."
          });
        });
      });
    } finally {
      if (!printWin.isDestroyed()) {
        printWin.destroy();
      }
    }
  });
  ipcMain.removeHandler("printer:open-usb-cash-drawer");
  ipcMain.handle("printer:open-usb-cash-drawer", async (event, options) => {
    if (!canUsePrinterCapabilities(event)) {
      return { success: false, error: "Origen de IPC no autorizado." };
    }
    const parsed = parseUsbPrinterRequest(options);
    if (!parsed) {
      return { success: false, error: "Nombre de impresora USB inválido." };
    }
    const printers = await event.sender.getPrintersAsync();
    if (!printers.some((printer) => printer.name === parsed.deviceName)) {
      return { success: false, error: "La impresora USB indicada no está instalada." };
    }
    return await openDrawerViaWindowsUsb(parsed.deviceName, parsed.timeoutMs);
  });
  createWindow();
  ipcMain.removeHandler("auth:set-token");
  ipcMain.handle("auth:set-token", (event, token) => {
    if (!isTrustedIpcSender(event) || !apiOrigin) return false;
    if (typeof token !== "string" || token.length < 16 || token.length > 8192) {
      return false;
    }
    if (safeStorage.isEncryptionAvailable()) {
      encryptedToken = safeStorage.encryptString(token);
    } else {
      encryptedToken = Buffer.from(token, "utf-8");
    }
    return true;
  });
  ipcMain.removeHandler("auth:clear-token");
  ipcMain.handle("auth:clear-token", (event) => {
    if (!isTrustedIpcSender(event)) return;
    encryptedToken = null;
  });
  ipcMain.removeHandler("auth:has-token");
  ipcMain.handle(
    "auth:has-token",
    (event) => isTrustedIpcSender(event) && encryptedToken !== null
  );
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const belongsToAppWindow = details.webContentsId === (win == null ? void 0 : win.webContents.id);
    let matchesApiOrigin = false;
    if (apiOrigin) {
      try {
        matchesApiOrigin = new URL(details.url).origin === apiOrigin;
      } catch {
        matchesApiOrigin = false;
      }
    }
    if (encryptedToken && belongsToAppWindow && matchesApiOrigin) {
      try {
        let tokenStr = "";
        if (safeStorage.isEncryptionAvailable()) {
          tokenStr = safeStorage.decryptString(encryptedToken);
        } else {
          tokenStr = encryptedToken.toString("utf-8");
        }
        const hasAuthHeader = Boolean(details.requestHeaders["Authorization"]) || Boolean(details.requestHeaders["authorization"]);
        if (!hasAuthHeader) {
          details.requestHeaders["Authorization"] = `Bearer ${tokenStr}`;
        }
      } catch (e) {
        console.error("[Main] Error desencriptando token:", e);
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const belongsToAppWindow = details.webContentsId === (win == null ? void 0 : win.webContents.id);
    if (!belongsToAppWindow || details.resourceType !== "mainFrame") {
      callback({ responseHeaders: details.responseHeaders });
      return;
    }
    const updatedHeaders = {
      ...details.responseHeaders ?? {}
    };
    for (const key of Object.keys(updatedHeaders)) {
      if (key.toLowerCase() === "content-security-policy") {
        delete updatedHeaders[key];
      }
    }
    updatedHeaders["Content-Security-Policy"] = [cspHeaderValue];
    callback({ responseHeaders: updatedHeaders });
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
