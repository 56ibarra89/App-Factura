import { app as w, BrowserWindow as E, ipcMain as c, safeStorage as p, session as b } from "electron";
import { fileURLToPath as A } from "node:url";
import d from "node:path";
import y from "node:net";
function S(s, a = 9100, r = 3e3) {
  return new Promise((e) => {
    const l = Date.now(), t = new y.Socket();
    let n = !1;
    const f = () => {
      t.removeAllListeners(), t.destroy();
    };
    t.setTimeout(r), t.on("connect", () => {
      if (n) return;
      n = !0;
      const u = Date.now() - l;
      f(), e({ success: !0, latencyMs: u });
    }), t.on("timeout", () => {
      n || (n = !0, f(), e({
        success: !1,
        error: `Tiempo de espera agotado (${r}ms) conectando a ${s}:${a}`
      }));
    }), t.on("error", (u) => {
      if (n) return;
      n = !0, f();
      let i = u.message;
      u.code === "ECONNREFUSED" ? i = `Conexión rechazada en ${s}:${a} (¿Impresora encendida o puerto incorrecto?)` : u.code === "EHOSTUNREACH" ? i = `Host inalcanzable ${s} (Verifica cable de red o Wi-Fi)` : u.code === "ETIMEDOUT" && (i = `Timeout de conexión con ${s}:${a}`), e({ success: !1, error: i });
    });
    try {
      t.connect(a, s);
    } catch (u) {
      if (n) return;
      n = !0, f(), e({
        success: !1,
        error: u instanceof Error ? u.message : String(u)
      });
    }
  });
}
function R(s, a = 9100, r, e = 3e3) {
  return new Promise((l) => {
    const t = new y.Socket();
    let n = !1;
    const f = () => {
      t.removeAllListeners(), t.destroy();
    };
    t.setTimeout(e);
    const u = typeof r == "string" ? Buffer.from(r, "binary") : Buffer.isBuffer(r) ? r : (Array.isArray(r), Buffer.from(r));
    t.on("connect", () => {
      t.write(u, (i) => {
        if (i) {
          n || (n = !0, f(), l({ success: !1, error: `Error enviando datos: ${i.message}` }));
          return;
        }
        t.end(() => {
          n || (n = !0, f(), l({ success: !0 }));
        });
      });
    }), t.on("timeout", () => {
      n || (n = !0, f(), l({
        success: !1,
        error: `Timeout de socket (${e}ms) al enviar datos a ${s}:${a}`
      }));
    }), t.on("error", (i) => {
      if (n) return;
      n = !0, f();
      let m = i.message;
      i.code === "ECONNREFUSED" ? m = `Conexión rechazada en ${s}:${a}` : i.code === "EHOSTUNREACH" ? m = `Impresora no alcanzable en ${s}:${a}` : i.code === "ETIMEDOUT" && (m = `Tiempo de conexión agotado con ${s}:${a}`), l({ success: !1, error: m });
    });
    try {
      t.connect(a, s);
    } catch (i) {
      if (n) return;
      n = !0, f(), l({
        success: !1,
        error: i instanceof Error ? i.message : String(i)
      });
    }
  });
}
const _ = Buffer.from([
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
function $(s, a = 9100, r = 3e3) {
  return R(s, a, _, r);
}
const h = d.dirname(A(import.meta.url));
process.env.APP_ROOT = d.join(h, "..");
const g = process.env.VITE_DEV_SERVER_URL, H = d.join(process.env.APP_ROOT, "dist-electron"), T = d.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = g ? d.join(process.env.APP_ROOT, "public") : T;
let o;
function v() {
  o = new E({
    icon: d.join(process.env.VITE_PUBLIC || "", "icon.png"),
    webPreferences: {
      preload: d.join(h, "preload.mjs"),
      sandbox: !0,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), o.setMenu(null), o.webContents.setWindowOpenHandler(() => ({ action: "deny" })), o.webContents.on("will-navigate", (s, a) => {
    const r = o == null ? void 0 : o.webContents.getURL();
    if (r)
      try {
        new URL(a).origin !== new URL(r).origin && s.preventDefault();
      } catch {
        s.preventDefault();
      }
  }), g ? o.loadURL(g) : o.loadFile(d.join(T, "index.html"));
}
w.on("window-all-closed", () => {
  process.platform !== "darwin" && (w.quit(), o = null);
});
w.on("activate", () => {
  E.getAllWindows().length === 0 && v();
});
w.whenReady().then(() => {
  c.removeAllListeners("print-silent"), c.on("print-silent", (r, e) => {
    r.sender.print(
      {
        silent: !0,
        printBackground: !0,
        deviceName: (e == null ? void 0 : e.deviceName) || "",
        margins: { marginType: "none" }
      },
      (l, t) => {
        l || console.error(
          "Error al imprimir silencioso en",
          (e == null ? void 0 : e.deviceName) || "impresora predeterminada:",
          t
        );
      }
    );
  }), c.removeHandler("get-system-printers"), c.handle("get-system-printers", async (r) => {
    try {
      return await r.sender.getPrintersAsync();
    } catch (e) {
      return console.error("[Main] Error obteniendo impresoras del sistema:", e), [];
    }
  }), c.removeHandler("test-network-printer"), c.handle(
    "test-network-printer",
    async (r, e) => await S(
      e.host,
      e.port,
      e.timeoutMs
    )
  ), c.removeHandler("print-network-raw"), c.handle(
    "print-network-raw",
    async (r, e) => await R(
      e.host,
      e.port,
      e.data,
      e.timeoutMs
    )
  ), c.removeHandler("open-cash-drawer"), c.handle(
    "open-cash-drawer",
    async (r, e) => e != null && e.host ? await $(e.host, e.port) : { success: !0 }
  ), v();
  let s = null, a = null;
  c.removeHandler("set-secure-token"), c.handle("set-secure-token", (r, e, l) => {
    if (r.sender !== (o == null ? void 0 : o.webContents) || typeof e != "string" || e.length < 16 || e.length > 8192)
      return !1;
    let t;
    try {
      const n = new URL(l);
      if (!["http:", "https:"].includes(n.protocol)) return !1;
      t = n.origin;
    } catch {
      return !1;
    }
    return p.isEncryptionAvailable() ? s = p.encryptString(e) : s = Buffer.from(e, "utf-8"), a = t, !0;
  }), c.removeHandler("clear-secure-token"), c.handle("clear-secure-token", (r) => {
    r.sender === (o == null ? void 0 : o.webContents) && (s = null, a = null);
  }), c.removeHandler("has-secure-token"), c.handle(
    "has-secure-token",
    (r) => r.sender === (o == null ? void 0 : o.webContents) && s !== null
  ), b.defaultSession.webRequest.onBeforeSendHeaders((r, e) => {
    const l = r.webContentsId === (o == null ? void 0 : o.webContents.id);
    let t = !1;
    if (a)
      try {
        t = new URL(r.url).origin === a;
      } catch {
        t = !1;
      }
    if (s && l && t)
      try {
        let n = "";
        p.isEncryptionAvailable() ? n = p.decryptString(s) : n = s.toString("utf-8"), r.requestHeaders.Authorization = `Bearer ${n}`;
      } catch (n) {
        console.error("[Main] Error desencriptando token:", n);
      }
    e({ requestHeaders: r.requestHeaders });
  });
});
export {
  H as MAIN_DIST,
  T as RENDERER_DIST,
  g as VITE_DEV_SERVER_URL
};
