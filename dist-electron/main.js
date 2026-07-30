import { app, BrowserWindow, ipcMain, safeStorage, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setMenu(null);
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
  ipcMain.on("print-silent", (event) => {
    event.sender.print({
      silent: true,
      printBackground: true,
      margins: { marginType: "none" }
    }, (success, failureReason) => {
      if (!success) console.error("Error al imprimir:", failureReason);
    });
  });
  createWindow();
  let encryptedToken = null;
  let targetApiUrl = null;
  ipcMain.removeAllListeners("set-secure-token");
  ipcMain.on("set-secure-token", (event, token, apiUrl) => {
    if (safeStorage.isEncryptionAvailable()) {
      encryptedToken = safeStorage.encryptString(token);
      targetApiUrl = apiUrl;
      console.log("[Main] Token encriptado y guardado en memoria segura.");
    } else {
      console.warn("[Main] safeStorage no disponible. Token guardado sin encriptar en memoria.");
      encryptedToken = Buffer.from(token, "utf-8");
      targetApiUrl = apiUrl;
    }
  });
  ipcMain.removeAllListeners("clear-secure-token");
  ipcMain.on("clear-secure-token", () => {
    encryptedToken = null;
    console.log("[Main] Token eliminado de memoria segura.");
  });
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (encryptedToken && targetApiUrl && details.url.startsWith(targetApiUrl)) {
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
