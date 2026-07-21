import { app as c, BrowserWindow as p, ipcMain as a, safeStorage as l, session as g } from "electron";
import { fileURLToPath as E } from "node:url";
import r from "node:path";
const u = r.dirname(E(import.meta.url));
process.env.APP_ROOT = r.join(u, "..");
const d = process.env.VITE_DEV_SERVER_URL, _ = r.join(process.env.APP_ROOT, "dist-electron"), m = r.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = d ? r.join(process.env.APP_ROOT, "public") : m;
let e;
function f() {
  e = new p({
    icon: r.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: r.join(u, "preload.mjs"),
      sandbox: !0,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), e.setMenu(null), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), a.on("print-silent", (n) => {
    n.sender.print({
      silent: !0,
      printBackground: !0,
      margins: { marginType: "none" }
    }, (t, s) => {
      t || console.error("Error al imprimir:", s);
    });
  }), d ? e.loadURL(d) : e.loadFile(r.join(m, "index.html"));
}
c.on("window-all-closed", () => {
  process.platform !== "darwin" && (c.quit(), e = null);
});
c.on("activate", () => {
  p.getAllWindows().length === 0 && f();
});
c.whenReady().then(() => {
  f();
  let n = null, i = null;
  a.removeAllListeners("set-secure-token"), a.on("set-secure-token", (t, s, o) => {
    l.isEncryptionAvailable() ? (n = l.encryptString(s), i = o, console.log("[Main] Token encriptado y guardado en memoria segura.")) : (console.warn("[Main] safeStorage no disponible. Token guardado sin encriptar en memoria."), n = Buffer.from(s, "utf-8"), i = o);
  }), a.removeAllListeners("clear-secure-token"), a.on("clear-secure-token", () => {
    n = null, console.log("[Main] Token eliminado de memoria segura.");
  }), g.defaultSession.webRequest.onBeforeSendHeaders((t, s) => {
    if (n && i && t.url.startsWith(i))
      try {
        let o = "";
        l.isEncryptionAvailable() ? o = l.decryptString(n) : o = n.toString("utf-8"), t.requestHeaders.Authorization = `Bearer ${o}`;
      } catch (o) {
        console.error("[Main] Error desencriptando token:", o);
      }
    s({ requestHeaders: t.requestHeaders });
  });
});
export {
  _ as MAIN_DIST,
  m as RENDERER_DIST,
  d as VITE_DEV_SERVER_URL
};
