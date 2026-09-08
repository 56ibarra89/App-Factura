import { app as w, BrowserWindow as g, ipcMain as c, safeStorage as p, session as v } from "electron";
import { fileURLToPath as A } from "node:url";
import f from "node:path";
import T from "node:net";
function _(n, a = 9100, r = 3e3) {
  return new Promise((e) => {
    const s = Date.now(), t = new T.Socket();
    let o = !1;
    const u = () => {
      t.removeAllListeners(), t.destroy();
    };
    t.setTimeout(r), t.on("connect", () => {
      if (o) return;
      o = !0;
      const l = Date.now() - s;
      u(), e({ success: !0, latencyMs: l });
    }), t.on("timeout", () => {
      o || (o = !0, u(), e({
        success: !1,
        error: `Tiempo de espera agotado (${r}ms) conectando a ${n}:${a}`
      }));
    }), t.on("error", (l) => {
      if (o) return;
      o = !0, u();
      let i = l.message;
      l.code === "ECONNREFUSED" ? i = `Conexión rechazada en ${n}:${a} (¿Impresora encendida o puerto incorrecto?)` : l.code === "EHOSTUNREACH" ? i = `Host inalcanzable ${n} (Verifica cable de red o Wi-Fi)` : l.code === "ETIMEDOUT" && (i = `Timeout de conexión con ${n}:${a}`), e({ success: !1, error: i });
    });
    try {
      t.connect(a, n);
    } catch (l) {
      if (o) return;
      o = !0, u(), e({
        success: !1,
        error: l instanceof Error ? l.message : String(l)
      });
    }
  });
}
function y(n, a = 9100, r, e = 3e3) {
  return new Promise((s) => {
    const t = new T.Socket();
    let o = !1;
    const u = () => {
      t.removeAllListeners(), t.destroy();
    };
    t.setTimeout(e);
    const l = typeof r == "string" ? Buffer.from(r, "binary") : Buffer.isBuffer(r) ? r : (Array.isArray(r), Buffer.from(r));
    t.on("connect", () => {
      t.write(l, (i) => {
        if (i) {
          o || (o = !0, u(), s({ success: !1, error: `Error enviando datos: ${i.message}` }));
          return;
        }
        t.end(() => {
          o || (o = !0, u(), s({ success: !0 }));
        });
      });
    }), t.on("timeout", () => {
      o || (o = !0, u(), s({
        success: !1,
        error: `Timeout de socket (${e}ms) al enviar datos a ${n}:${a}`
      }));
    }), t.on("error", (i) => {
      if (o) return;
      o = !0, u();
      let m = i.message;
      i.code === "ECONNREFUSED" ? m = `Conexión rechazada en ${n}:${a}` : i.code === "EHOSTUNREACH" ? m = `Impresora no alcanzable en ${n}:${a}` : i.code === "ETIMEDOUT" && (m = `Tiempo de conexión agotado con ${n}:${a}`), s({ success: !1, error: m });
    });
    try {
      t.connect(a, n);
    } catch (i) {
      if (o) return;
      o = !0, u(), s({
        success: !1,
        error: i instanceof Error ? i.message : String(i)
      });
    }
  });
}
const $ = Buffer.from([
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
function P(n, a = 9100, r = 3e3) {
  return y(n, a, $, r);
}
const R = f.dirname(A(import.meta.url));
process.env.APP_ROOT = f.join(R, "..");
const E = process.env.VITE_DEV_SERVER_URL, N = f.join(process.env.APP_ROOT, "dist-electron"), k = f.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = E ? f.join(process.env.APP_ROOT, "public") : k;
let d;
function S() {
  d = new g({
    icon: f.join(process.env.VITE_PUBLIC || "", "icon.png"),
    webPreferences: {
      preload: f.join(R, "preload.mjs"),
      sandbox: !0,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), d.setMenu(null), E ? d.loadURL(E) : d.loadFile(f.join(k, "index.html"));
}
w.on("window-all-closed", () => {
  process.platform !== "darwin" && (w.quit(), d = null);
});
w.on("activate", () => {
  g.getAllWindows().length === 0 && S();
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
      (s, t) => {
        s || console.error(
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
    async (r, e) => await _(
      e.host,
      e.port,
      e.timeoutMs
    )
  ), c.removeHandler("print-network-raw"), c.handle(
    "print-network-raw",
    async (r, e) => await y(
      e.host,
      e.port,
      e.data,
      e.timeoutMs
    )
  ), c.removeHandler("open-cash-drawer"), c.handle(
    "open-cash-drawer",
    async (r, e) => e != null && e.host ? await P(e.host, e.port) : { success: !0 }
  ), S();
  let n = null, a = null;
  c.removeAllListeners("set-secure-token"), c.on("set-secure-token", (r, e, s) => {
    p.isEncryptionAvailable() ? (n = p.encryptString(e), a = s, console.log("[Main] Token encriptado y guardado en memoria segura.")) : (console.warn("[Main] safeStorage no disponible. Token guardado sin encriptar en memoria."), n = Buffer.from(e, "utf-8"), a = s);
  }), c.removeAllListeners("clear-secure-token"), c.on("clear-secure-token", () => {
    n !== null && (n = null, console.log("[Main] Token eliminado de memoria segura."));
  }), v.defaultSession.webRequest.onBeforeSendHeaders((r, e) => {
    if (n && a && r.url.startsWith(a))
      try {
        let s = "";
        p.isEncryptionAvailable() ? s = p.decryptString(n) : s = n.toString("utf-8"), r.requestHeaders.Authorization = `Bearer ${s}`;
      } catch (s) {
        console.error("[Main] Error desencriptando token:", s);
      }
    e({ requestHeaders: r.requestHeaders });
  });
});
export {
  N as MAIN_DIST,
  k as RENDERER_DIST,
  E as VITE_DEV_SERVER_URL
};
