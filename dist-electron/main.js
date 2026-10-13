import { app as y, BrowserWindow as R, ipcMain as l, safeStorage as m, session as D } from "electron";
import { fileURLToPath as O } from "node:url";
import d from "node:path";
import A, { isIP as U } from "node:net";
function M(e, n = 9100, r = 3e3) {
  return new Promise((t) => {
    const s = Date.now(), i = new A.Socket();
    let o = !1;
    const f = () => {
      i.removeAllListeners(), i.destroy();
    };
    i.setTimeout(r), i.on("connect", () => {
      if (o) return;
      o = !0;
      const c = Date.now() - s;
      f(), t({ success: !0, latencyMs: c });
    }), i.on("timeout", () => {
      o || (o = !0, f(), t({
        success: !1,
        error: `Tiempo de espera agotado (${r}ms) conectando a ${e}:${n}`
      }));
    }), i.on("error", (c) => {
      if (o) return;
      o = !0, f();
      let a = c.message;
      c.code === "ECONNREFUSED" ? a = `Conexión rechazada en ${e}:${n} (¿Impresora encendida o puerto incorrecto?)` : c.code === "EHOSTUNREACH" ? a = `Host inalcanzable ${e} (Verifica cable de red o Wi-Fi)` : c.code === "ETIMEDOUT" && (a = `Timeout de conexión con ${e}:${n}`), t({ success: !1, error: a });
    });
    try {
      i.connect(n, e);
    } catch (c) {
      if (o) return;
      o = !0, f(), t({
        success: !1,
        error: c instanceof Error ? c.message : String(c)
      });
    }
  });
}
function I(e, n = 9100, r, t = 3e3) {
  return new Promise((s) => {
    const i = new A.Socket();
    let o = !1;
    const f = () => {
      i.removeAllListeners(), i.destroy();
    };
    i.setTimeout(t);
    const c = typeof r == "string" ? Buffer.from(r, "binary") : Buffer.isBuffer(r) ? r : (Array.isArray(r), Buffer.from(r));
    i.on("connect", () => {
      i.write(c, (a) => {
        if (a) {
          o || (o = !0, f(), s({ success: !1, error: `Error enviando datos: ${a.message}` }));
          return;
        }
        i.end(() => {
          o || (o = !0, f(), s({ success: !0 }));
        });
      });
    }), i.on("timeout", () => {
      o || (o = !0, f(), s({
        success: !1,
        error: `Timeout de socket (${t}ms) al enviar datos a ${e}:${n}`
      }));
    }), i.on("error", (a) => {
      if (o) return;
      o = !0, f();
      let p = a.message;
      a.code === "ECONNREFUSED" ? p = `Conexión rechazada en ${e}:${n}` : a.code === "EHOSTUNREACH" ? p = `Impresora no alcanzable en ${e}:${n}` : a.code === "ETIMEDOUT" && (p = `Tiempo de conexión agotado con ${e}:${n}`), s({ success: !1, error: p });
    });
    try {
      i.connect(n, e);
    } catch (a) {
      if (o) return;
      o = !0, f(), s({
        success: !1,
        error: a instanceof Error ? a.message : String(a)
      });
    }
  });
}
const k = Buffer.from([
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
function v(e, n = 9100, r = 3e3) {
  return I(e, n, k, r);
}
const L = 9100, $ = 3e3, C = 500, H = 1e4, B = 256 * 1024;
function P(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function j(e) {
  if (U(e) !== 4) return !1;
  const [n, r] = e.split(".").map(Number);
  return n === 10 || n === 172 && r >= 16 && r <= 31 || n === 192 && r === 168;
}
function V(e) {
  return Number.isInteger(e) && e >= 9100 && e <= 9109;
}
function E(e) {
  if (!P(e) || typeof e.host != "string") return null;
  const n = e.host.trim(), r = e.port === void 0 ? L : e.port, t = e.timeoutMs === void 0 ? $ : e.timeoutMs;
  return !j(n) || typeof r != "number" || !V(r) || typeof t != "number" || !Number.isInteger(t) || t < C || t > H ? null : { host: n, port: r, timeoutMs: t };
}
function F(e) {
  let n;
  if (Array.isArray(e)) {
    if (!e.every(
      (r) => Number.isInteger(r) && r >= 0 && r <= 255
    ))
      return null;
    n = Buffer.from(e);
  } else if (e instanceof Uint8Array)
    n = Buffer.from(e.buffer, e.byteOffset, e.byteLength);
  else
    return null;
  return n.byteLength === 0 || n.byteLength > B ? null : n;
}
function x(e) {
  if (e === void 0) return;
  if (!P(e) || e.deviceName === void 0 || typeof e.deviceName != "string") return null;
  const n = e.deviceName.trim();
  return n.length === 0 || n.length > 256 ? null : n;
}
function W(e) {
  try {
    const n = new URL(e);
    return n.protocol !== "http:" && n.protocol !== "https:" ? null : n.origin;
  } catch {
    return null;
  }
}
const N = d.dirname(O(import.meta.url));
process.env.APP_ROOT = d.join(N, "..");
const T = process.env.VITE_DEV_SERVER_URL, G = d.join(process.env.APP_ROOT, "dist-electron"), _ = d.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = T ? d.join(process.env.APP_ROOT, "public") : _;
let u;
const h = W("http://localhost:3000");
function g(e) {
  return !!(u && !u.isDestroyed() && e.sender === u.webContents && e.senderFrame === u.webContents.mainFrame);
}
const w = {
  success: !1,
  error: "Operación nativa no autorizada."
};
function S() {
  u = new R({
    icon: d.join(process.env.VITE_PUBLIC || "", "icon.png"),
    webPreferences: {
      preload: d.join(N, "preload.mjs"),
      sandbox: !0,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), u.setMenu(null), u.webContents.setWindowOpenHandler(() => ({ action: "deny" })), u.webContents.on("will-navigate", (e, n) => {
    const r = u == null ? void 0 : u.webContents.getURL();
    if (r)
      try {
        new URL(n).origin !== new URL(r).origin && e.preventDefault();
      } catch {
        e.preventDefault();
      }
  }), T ? u.loadURL(T) : u.loadFile(d.join(_, "index.html"));
}
y.on("window-all-closed", () => {
  process.platform !== "darwin" && (y.quit(), u = null);
});
y.on("activate", () => {
  R.getAllWindows().length === 0 && S();
});
y.whenReady().then(() => {
  let e = null;
  const n = (r) => g(r) && e !== null;
  l.removeHandler("printer:print-current-page"), l.handle("printer:print-current-page", async (r, t) => {
    if (!n(r)) return w;
    const s = x(t);
    return s === null ? { success: !1, error: "Impresora no válida." } : s && !(await r.sender.getPrintersAsync()).some((o) => o.name === s) ? { success: !1, error: "La impresora indicada no está instalada." } : await new Promise((i) => {
      r.sender.print(
        {
          silent: !0,
          printBackground: !0,
          deviceName: s || "",
          margins: { marginType: "none" }
        },
        (o, f) => {
          i(
            o ? { success: !0 } : { success: !1, error: f || "No fue posible imprimir." }
          );
        }
      );
    });
  }), l.removeHandler("printer:list-system"), l.handle("printer:list-system", async (r) => {
    if (!n(r)) return [];
    try {
      return (await r.sender.getPrintersAsync()).map(({ name: s, displayName: i, description: o, options: f }) => {
        const c = f, a = c.status ?? c["printer-status"], p = Number.isFinite(Number(a)) ? Number(a) : 0, b = c.isDefault ?? c["is-default"];
        return { name: s, displayName: i, description: o, status: p, isDefault: b === !0 || b === "true" };
      });
    } catch (t) {
      return console.error("[Main] Error obteniendo impresoras del sistema:", t), [];
    }
  }), l.removeHandler("printer:test-network"), l.handle(
    "printer:test-network",
    async (r, t) => {
      if (!n(r)) return w;
      const s = E(t);
      return s ? await M(
        s.host,
        s.port,
        s.timeoutMs
      ) : {
        success: !1,
        error: "Solo se permiten impresoras IPv4 privadas en puertos 9100-9109."
      };
    }
  ), l.removeHandler("printer:print-ticket"), l.handle(
    "printer:print-ticket",
    async (r, t) => {
      if (!n(r)) return w;
      const s = E(t), i = typeof t == "object" && t !== null && "data" in t ? F(t.data) : null;
      return !s || !i ? { success: !1, error: "Destino o contenido de impresión no válido." } : await I(
        s.host,
        s.port,
        i,
        s.timeoutMs
      );
    }
  ), l.removeHandler("printer:open-network-drawer"), l.handle(
    "printer:open-network-drawer",
    async (r, t) => {
      if (!n(r)) return w;
      const s = E(t);
      return s ? await v(
        s.host,
        s.port,
        s.timeoutMs
      ) : { success: !1, error: "Destino de gaveta no válido." };
    }
  ), S(), l.removeHandler("auth:set-token"), l.handle("auth:set-token", (r, t) => !g(r) || !h || typeof t != "string" || t.length < 16 || t.length > 8192 ? !1 : (m.isEncryptionAvailable() ? e = m.encryptString(t) : e = Buffer.from(t, "utf-8"), !0)), l.removeHandler("auth:clear-token"), l.handle("auth:clear-token", (r) => {
    g(r) && (e = null);
  }), l.removeHandler("auth:has-token"), l.handle(
    "auth:has-token",
    (r) => g(r) && e !== null
  ), D.defaultSession.webRequest.onBeforeSendHeaders((r, t) => {
    const s = r.webContentsId === (u == null ? void 0 : u.webContents.id);
    let i = !1;
    if (h)
      try {
        i = new URL(r.url).origin === h;
      } catch {
        i = !1;
      }
    if (e && s && i)
      try {
        let o = "";
        m.isEncryptionAvailable() ? o = m.decryptString(e) : o = e.toString("utf-8"), r.requestHeaders.Authorization = `Bearer ${o}`;
      } catch (o) {
        console.error("[Main] Error desencriptando token:", o);
      }
    t({ requestHeaders: r.requestHeaders });
  });
});
export {
  G as MAIN_DIST,
  _ as RENDERER_DIST,
  T as VITE_DEV_SERVER_URL
};
