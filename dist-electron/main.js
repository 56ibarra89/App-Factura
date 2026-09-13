import { app, BrowserWindow, ipcMain, safeStorage, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import net from "node:net";
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
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
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
  ipcMain.removeAllListeners("print-silent");
  ipcMain.on("print-silent", (event, options) => {
    event.sender.print(
      {
        silent: true,
        printBackground: true,
        deviceName: (options == null ? void 0 : options.deviceName) || "",
        margins: { marginType: "none" }
      },
      (success, failureReason) => {
        if (!success) {
          console.error(
            "Error al imprimir silencioso en",
            (options == null ? void 0 : options.deviceName) || "impresora predeterminada:",
            failureReason
          );
        }
      }
    );
  });
  ipcMain.removeHandler("get-system-printers");
  ipcMain.handle("get-system-printers", async (event) => {
    try {
      const printers = await event.sender.getPrintersAsync();
      return printers;
    } catch (error) {
      console.error("[Main] Error obteniendo impresoras del sistema:", error);
      return [];
    }
  });
  ipcMain.removeHandler("test-network-printer");
  ipcMain.handle(
    "test-network-printer",
    async (_event, options) => {
      return await testNetworkPrinter(
        options.host,
        options.port,
        options.timeoutMs
      );
    }
  );
  ipcMain.removeHandler("print-network-raw");
  ipcMain.handle(
    "print-network-raw",
    async (_event, options) => {
      return await printNetworkRaw(
        options.host,
        options.port,
        options.data,
        options.timeoutMs
      );
    }
  );
  ipcMain.removeHandler("open-cash-drawer");
  ipcMain.handle(
    "open-cash-drawer",
    async (_event, options) => {
      if (options == null ? void 0 : options.host) {
        return await openDrawerViaNetwork(options.host, options.port);
      }
      return { success: true };
    }
  );
  createWindow();
  let encryptedToken = null;
  let targetApiOrigin = null;
  ipcMain.removeHandler("set-secure-token");
  ipcMain.handle("set-secure-token", (event, token, apiUrl) => {
    if (event.sender !== (win == null ? void 0 : win.webContents)) return false;
    if (typeof token !== "string" || token.length < 16 || token.length > 8192) {
      return false;
    }
    let apiOrigin;
    try {
      const parsed = new URL(apiUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) return false;
      apiOrigin = parsed.origin;
    } catch {
      return false;
    }
    if (safeStorage.isEncryptionAvailable()) {
      encryptedToken = safeStorage.encryptString(token);
    } else {
      encryptedToken = Buffer.from(token, "utf-8");
    }
    targetApiOrigin = apiOrigin;
    return true;
  });
  ipcMain.removeHandler("clear-secure-token");
  ipcMain.handle("clear-secure-token", (event) => {
    if (event.sender !== (win == null ? void 0 : win.webContents)) return;
    encryptedToken = null;
    targetApiOrigin = null;
  });
  ipcMain.removeHandler("has-secure-token");
  ipcMain.handle(
    "has-secure-token",
    (event) => event.sender === (win == null ? void 0 : win.webContents) && encryptedToken !== null
  );
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const belongsToAppWindow = details.webContentsId === (win == null ? void 0 : win.webContents.id);
    let matchesApiOrigin = false;
    if (targetApiOrigin) {
      try {
        matchesApiOrigin = new URL(details.url).origin === targetApiOrigin;
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
