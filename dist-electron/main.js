import { app, BrowserWindow, ipcMain, safeStorage, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import net, { isIP } from "node:net";
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
  if (!isRecord(value) || value.deviceName === void 0) return null;
  if (typeof value.deviceName !== "string") return null;
  const deviceName = value.deviceName.trim();
  if (deviceName.length === 0 || deviceName.length > 256) return null;
  return deviceName;
}
function configuredApiOrigin(apiUrl) {
  try {
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
const apiOrigin = configuredApiOrigin("http://localhost:3000");
function isTrustedIpcSender(event) {
  return Boolean(
    win && !win.isDestroyed() && event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame
  );
}
const deniedIpcResult = {
  success: false,
  error: "Operación nativa no autorizada."
};
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || "", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
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
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
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
  let encryptedToken = null;
  const canUsePrinterCapabilities = (event) => isTrustedIpcSender(event) && encryptedToken !== null;
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
    return await new Promise((resolve) => {
      event.sender.print(
        {
          silent: true,
          printBackground: true,
          deviceName: deviceName || "",
          margins: { marginType: "none" }
        },
        (success, failureReason) => {
          resolve(
            success ? { success: true } : { success: false, error: failureReason || "No fue posible imprimir." }
          );
        }
      );
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
        details.requestHeaders["Authorization"] = `Bearer ${tokenStr}`;
      } catch (e) {
        console.error("[Main] Error desencriptando token:", e);
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
