import { app as o, BrowserWindow as i, ipcMain as d } from "electron";
import { fileURLToPath as m } from "node:url";
import n from "node:path";
const r = n.dirname(m(import.meta.url));
process.env.APP_ROOT = n.join(r, "..");
const t = process.env.VITE_DEV_SERVER_URL, f = n.join(process.env.APP_ROOT, "dist-electron"), s = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = t ? n.join(process.env.APP_ROOT, "public") : s;
let e;
function a() {
  e = new i({
    icon: n.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: n.join(r, "preload.mjs"),
      sandbox: !0,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), e.setMenu(null), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), d.on("print-silent", (l) => {
    l.sender.print({
      silent: !0,
      printBackground: !0,
      margins: { marginType: "none" }
    }, (c, p) => {
      c || console.error("Error al imprimir:", p);
    });
  }), t ? e.loadURL(t) : e.loadFile(n.join(s, "index.html"));
}
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  i.getAllWindows().length === 0 && a();
});
o.whenReady().then(a);
export {
  f as MAIN_DIST,
  s as RENDERER_DIST,
  t as VITE_DEV_SERVER_URL
};
