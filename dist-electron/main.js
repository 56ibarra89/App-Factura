import { app as c, BrowserWindow as d, ipcMain as i, safeStorage as l, session as g } from "electron";
import { fileURLToPath as E } from "node:url";
import n from "node:path";
const u = n.dirname(E(import.meta.url));
process.env.APP_ROOT = n.join(u, "..");
const p = process.env.VITE_DEV_SERVER_URL, v = n.join(process.env.APP_ROOT, "dist-electron"), m = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? n.join(process.env.APP_ROOT, "public") : m;
let s;
function f() {
  s = new d({
    icon: n.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: n.join(u, "preload.mjs"),
      sandbox: !0,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), s.setMenu(null), p ? s.loadURL(p) : s.loadFile(n.join(m, "index.html"));
}
c.on("window-all-closed", () => {
  process.platform !== "darwin" && (c.quit(), s = null);
});
c.on("activate", () => {
  d.getAllWindows().length === 0 && f();
});
c.whenReady().then(() => {
  i.removeAllListeners("print-silent"), i.on("print-silent", (o) => {
    o.sender.print({
      silent: !0,
      printBackground: !0,
      margins: { marginType: "none" }
    }, (t, e) => {
      t || console.error("Error al imprimir:", e);
    });
  }), f();
  let r = null, a = null;
  i.removeAllListeners("set-secure-token"), i.on("set-secure-token", (o, t, e) => {
    l.isEncryptionAvailable() ? (r = l.encryptString(t), a = e, console.log("[Main] Token encriptado y guardado en memoria segura.")) : (console.warn("[Main] safeStorage no disponible. Token guardado sin encriptar en memoria."), r = Buffer.from(t, "utf-8"), a = e);
  }), i.removeAllListeners("clear-secure-token"), i.on("clear-secure-token", () => {
    r = null, console.log("[Main] Token eliminado de memoria segura.");
  }), g.defaultSession.webRequest.onBeforeSendHeaders((o, t) => {
    if (r && a && o.url.startsWith(a))
      try {
        let e = "";
        l.isEncryptionAvailable() ? e = l.decryptString(r) : e = r.toString("utf-8"), o.requestHeaders.Authorization = `Bearer ${e}`;
      } catch (e) {
        console.error("[Main] Error desencriptando token:", e);
      }
    t({ requestHeaders: o.requestHeaders });
  });
});
export {
  v as MAIN_DIST,
  m as RENDERER_DIST,
  p as VITE_DEV_SERVER_URL
};
