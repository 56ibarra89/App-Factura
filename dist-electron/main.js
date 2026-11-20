import { app as b, BrowserWindow as T, ipcMain as u, safeStorage as E, session as N } from "electron";
import * as j from "node:fs";
import _ from "node:fs";
import { fileURLToPath as V } from "node:url";
import * as z from "node:path";
import g from "node:path";
import O, { isIP as q } from "node:net";
import { execFile as G } from "node:child_process";
import { createHash as Z } from "node:crypto";
import { tmpdir as K } from "node:os";
function X(e, r = 9100, s = 3e3) {
  return new Promise((a) => {
    const d = Date.now(), l = new O.Socket();
    let t = !1;
    const o = () => {
      l.removeAllListeners(), l.destroy();
    };
    l.setTimeout(s), l.on("connect", () => {
      if (t) return;
      t = !0;
      const n = Date.now() - d;
      o(), a({ success: !0, latencyMs: n });
    }), l.on("timeout", () => {
      t || (t = !0, o(), a({
        success: !1,
        error: `Tiempo de espera agotado (${s}ms) conectando a ${e}:${r}`
      }));
    }), l.on("error", (n) => {
      if (t) return;
      t = !0, o();
      let i = n.message;
      n.code === "ECONNREFUSED" ? i = `Conexión rechazada en ${e}:${r} (¿Impresora encendida o puerto incorrecto?)` : n.code === "EHOSTUNREACH" ? i = `Host inalcanzable ${e} (Verifica cable de red o Wi-Fi)` : n.code === "ETIMEDOUT" && (i = `Timeout de conexión con ${e}:${r}`), a({ success: !1, error: i });
    });
    try {
      l.connect(r, e);
    } catch (n) {
      if (t) return;
      t = !0, o(), a({
        success: !1,
        error: n instanceof Error ? n.message : String(n)
      });
    }
  });
}
function U(e, r = 9100, s, a = 3e3) {
  return new Promise((d) => {
    const l = new O.Socket();
    let t = !1;
    const o = () => {
      l.removeAllListeners(), l.destroy();
    };
    l.setTimeout(a);
    const n = typeof s == "string" ? Buffer.from(s, "binary") : Buffer.isBuffer(s) ? s : (Array.isArray(s), Buffer.from(s));
    l.on("connect", () => {
      l.write(n, (i) => {
        if (i) {
          t || (t = !0, o(), d({ success: !1, error: `Error enviando datos: ${i.message}` }));
          return;
        }
        l.end(() => {
          t || (t = !0, o(), d({ success: !0 }));
        });
      });
    }), l.on("timeout", () => {
      t || (t = !0, o(), d({
        success: !1,
        error: `Timeout de socket (${a}ms) al enviar datos a ${e}:${r}`
      }));
    }), l.on("error", (i) => {
      if (t) return;
      t = !0, o();
      let c = i.message;
      i.code === "ECONNREFUSED" ? c = `Conexión rechazada en ${e}:${r}` : i.code === "EHOSTUNREACH" ? c = `Impresora no alcanzable en ${e}:${r}` : i.code === "ETIMEDOUT" && (c = `Tiempo de conexión agotado con ${e}:${r}`), d({ success: !1, error: c });
    });
    try {
      l.connect(r, e);
    } catch (i) {
      if (t) return;
      t = !0, o(), d({
        success: !1,
        error: i instanceof Error ? i.message : String(i)
      });
    }
  });
}
const W = Buffer.from([
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
function Y(e, r = 9100, s = 3e3) {
  return U(e, r, W, s);
}
function B(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function $(e) {
  if (e == null || e === "")
    return;
  if (typeof e != "string")
    return null;
  const r = e.trim();
  return !r || r.length > 260 || /[\r\n\0]/.test(r) ? null : r;
}
function J(e) {
  if (!B(e) || typeof e.html != "string")
    return null;
  const r = e.html.trim();
  if (!r || r.length > 2e5)
    return null;
  const s = $(e.deviceName);
  return s === null ? null : {
    html: e.html,
    deviceName: s
  };
}
function Q(e) {
  if (!B(e))
    return null;
  const r = $(e.deviceName);
  if (!r)
    return null;
  const s = e.timeoutMs, a = typeof s == "number" && Number.isFinite(s) ? Math.min(15e3, Math.max(500, Math.trunc(s))) : 4e3;
  return {
    deviceName: r,
    timeoutMs: a
  };
}
const M = `
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
`, C = z.join(
  K(),
  `pizza-to-go-raw-spooler-${process.pid}-${Z("sha256").update(M).digest("hex").slice(0, 16)}.dll`
);
let L = Promise.resolve();
function ee(e, r, s = 4e3) {
  if (process.platform !== "win32")
    return Promise.resolve({
      success: !1,
      error: "La apertura/impresión RAW USB solo está soportada en Windows."
    });
  const a = typeof r == "string" ? Buffer.from(r, "binary") : Buffer.from(r);
  if (a.length === 0)
    return Promise.resolve({
      success: !1,
      error: "No hay datos RAW para enviar a la impresora USB."
    });
  const d = L.then(() => new Promise((l) => {
    G(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", M],
      {
        env: {
          ...process.env,
          POS_PRINTER_NAME: e,
          POS_RAW_BASE64: a.toString("base64"),
          POS_RAW_HELPER_DLL: C
        },
        timeout: j.existsSync(C) ? s : Math.max(s, 1e4),
        windowsHide: !0
      },
      (t, o, n) => {
        if (!t) {
          l({ success: !0 });
          return;
        }
        const i = (n == null ? void 0 : n.trim()) || t.message || String(t);
        l({
          success: !1,
          error: `Error enviando pulso RAW a "${e}": ${i}`
        });
      }
    );
  }));
  return L = d.then(() => {
  }, () => {
  }), d;
}
function re(e, r = 4e3) {
  return ee(e, W, r);
}
const te = 9100, ne = 3e3, se = 500, oe = 1e4, ie = 256 * 1024;
function v(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function ae(e) {
  if (q(e) !== 4) return !1;
  const [r, s] = e.split(".").map(Number);
  return r === 10 || r === 172 && s >= 16 && s <= 31 || r === 192 && s === 168;
}
function ce(e) {
  return Number.isInteger(e) && e >= 9100 && e <= 9109;
}
function A(e) {
  if (!v(e) || typeof e.host != "string") return null;
  const r = e.host.trim(), s = e.port === void 0 ? te : e.port, a = e.timeoutMs === void 0 ? ne : e.timeoutMs;
  return !ae(r) || typeof s != "number" || !ce(s) || typeof a != "number" || !Number.isInteger(a) || a < se || a > oe ? null : { host: r, port: s, timeoutMs: a };
}
function le(e) {
  let r;
  if (Array.isArray(e)) {
    if (!e.every(
      (s) => Number.isInteger(s) && s >= 0 && s <= 255
    ))
      return null;
    r = Buffer.from(e);
  } else if (e instanceof Uint8Array)
    r = Buffer.from(e.buffer, e.byteOffset, e.byteLength);
  else
    return null;
  return r.byteLength === 0 || r.byteLength > ie ? null : r;
}
function ue(e) {
  if (e === void 0) return;
  if (!v(e)) return null;
  if (e.deviceName === void 0) return;
  if (typeof e.deviceName != "string") return null;
  const r = e.deviceName.trim();
  if (r.length !== 0)
    return r.length > 256 ? null : r;
}
function S(e) {
  if (typeof e != "string") return null;
  const r = e.trim();
  if (!r) return null;
  try {
    const s = new URL(r);
    if (s.protocol !== "http:" && s.protocol !== "https:") return null;
    const a = s.pathname.replace(/\/+$/, "");
    return a === "" || a === "/" ? s.origin : `${s.origin}${a}`;
  } catch {
    return null;
  }
}
function fe(e) {
  var a, d;
  const r = S((a = e.env) == null ? void 0 : a.POS_API_BASE_URL);
  if (r) return r;
  const s = S((d = e.env) == null ? void 0 : d.VITE_API_BASE_URL);
  if (s) return s;
  if (e.configFileContent)
    try {
      const l = JSON.parse(e.configFileContent);
      if (v(l)) {
        const t = S(l.apiBaseUrl);
        if (t) return t;
      }
    } catch {
    }
  return S(e.builtInUrl);
}
function pe(e) {
  if (!e) return null;
  try {
    const r = new URL(e);
    return r.protocol !== "http:" && r.protocol !== "https:" ? null : r.origin;
  } catch {
    return null;
  }
}
function de(e) {
  const r = ["'self'", "ws://localhost:*", "http://localhost:*"];
  return e && (r.push(e), e.startsWith("https://") ? r.push(e.replace("https://", "wss://")) : e.startsWith("http://") && r.push(e.replace("http://", "ws://"))), [
    "default-src 'self'",
    "script-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src ${r.join(" ")}`
  ].join("; ");
}
const H = g.dirname(V(import.meta.url));
process.env.APP_ROOT = g.join(H, "..");
const R = process.env.VITE_DEV_SERVER_URL, Ie = g.join(process.env.APP_ROOT, "dist-electron"), x = g.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = R ? g.join(process.env.APP_ROOT, "public") : x;
let f;
function y(e) {
  return !!(f && !f.isDestroyed() && e.sender === f.webContents && e.senderFrame === f.webContents.mainFrame);
}
function me() {
  const e = g.join(b.getPath("userData"), "runtime-config.json");
  let r = null;
  try {
    _.existsSync(e) && (r = _.readFileSync(e, "utf8"));
  } catch (s) {
    console.warn("[Main] No se pudo leer runtime-config.json:", s);
  }
  return fe({
    env: process.env,
    configFileContent: r,
    builtInUrl: "http://localhost:3000"
  });
}
const I = {
  success: !1,
  error: "Operación nativa no autorizada."
};
function k() {
  f = new T({
    icon: g.join(process.env.VITE_PUBLIC || "", "icon.png"),
    webPreferences: {
      preload: g.join(H, "preload.mjs"),
      sandbox: !0,
      contextIsolation: !0,
      nodeIntegration: !1
    }
  }), f.setMenu(null), f.webContents.setWindowOpenHandler(() => ({ action: "deny" })), f.webContents.on("will-navigate", (e, r) => {
    const s = f == null ? void 0 : f.webContents.getURL();
    if (s)
      try {
        new URL(r).origin !== new URL(s).origin && e.preventDefault();
      } catch {
        e.preventDefault();
      }
  }), R ? f.loadURL(R) : f.loadFile(g.join(x, "index.html"));
}
b.on("window-all-closed", () => {
  process.platform !== "darwin" && (b.quit(), f = null);
});
b.on("activate", () => {
  T.getAllWindows().length === 0 && k();
});
b.whenReady().then(() => {
  const e = me(), r = pe(e ?? void 0), s = de(r);
  let a = null, d = !1;
  const l = (t) => y(t) && a !== null;
  u.removeAllListeners("config:get-api-base-url-sync"), u.on("config:get-api-base-url-sync", (t) => {
    t.returnValue = y(t) ? e ?? "" : "";
  }), u.removeHandler("config:get-api-base-url"), u.handle(
    "config:get-api-base-url",
    (t) => y(t) ? e ?? "" : ""
  ), u.removeHandler("printer:print-current-page"), u.handle("printer:print-current-page", async (t, o) => {
    if (!l(t)) return I;
    const n = ue(o);
    if (n === null)
      return { success: !1, error: "Impresora no válida." };
    if (n && !(await t.sender.getPrintersAsync()).some((p) => p.name === n))
      return { success: !1, error: "La impresora indicada no está instalada." };
    if (t.sender.isDestroyed())
      return {
        success: !1,
        error: "La ventana de impresión se cerró antes de completar la impresión."
      };
    const i = 15e3;
    return await new Promise((c) => {
      let p = !1;
      const m = setTimeout(() => {
        p || (p = !0, c({
          success: !1,
          error: `Tiempo de espera agotado (${i}ms) al imprimir.`
        }));
      }, i);
      try {
        t.sender.print(
          {
            silent: !0,
            printBackground: !0,
            deviceName: n || "",
            margins: { marginType: "none" }
          },
          (h, w) => {
            p || (p = !0, clearTimeout(m), c(
              h ? { success: !0 } : { success: !1, error: w || "No fue posible imprimir." }
            ));
          }
        );
      } catch (h) {
        if (p) return;
        p = !0, clearTimeout(m), c({
          success: !1,
          error: h instanceof Error ? h.message : "Error inesperado al imprimir."
        });
      }
    });
  }), u.removeHandler("printer:list-system"), u.handle("printer:list-system", async (t) => {
    if (!l(t)) return [];
    try {
      return (await t.sender.getPrintersAsync()).map(({ name: n, displayName: i, description: c, options: p }) => {
        const m = p, h = m.status ?? m["printer-status"], w = Number.isFinite(Number(h)) ? Number(h) : 0, P = m.isDefault ?? m["is-default"];
        return { name: n, displayName: i, description: c, status: w, isDefault: P === !0 || P === "true" };
      });
    } catch (o) {
      return console.error("[Main] Error obteniendo impresoras del sistema:", o), [];
    }
  }), u.removeHandler("printer:test-network"), u.handle(
    "printer:test-network",
    async (t, o) => {
      if (!l(t)) return I;
      const n = A(o);
      return n ? await X(
        n.host,
        n.port,
        n.timeoutMs
      ) : {
        success: !1,
        error: "Solo se permiten impresoras IPv4 privadas en puertos 9100-9109."
      };
    }
  ), u.removeHandler("printer:print-ticket"), u.handle(
    "printer:print-ticket",
    async (t, o) => {
      if (!l(t)) return I;
      const n = A(o), i = typeof o == "object" && o !== null && "data" in o ? le(o.data) : null;
      return !n || !i ? { success: !1, error: "Destino o contenido de impresión no válido." } : await U(
        n.host,
        n.port,
        i,
        n.timeoutMs
      );
    }
  ), u.removeHandler("printer:open-network-drawer"), u.handle(
    "printer:open-network-drawer",
    async (t, o) => {
      if (!l(t)) return I;
      const n = A(o);
      return n ? await Y(
        n.host,
        n.port,
        n.timeoutMs
      ) : { success: !1, error: "Destino de gaveta no válido." };
    }
  ), u.removeHandler("printer:print-html"), u.handle("printer:print-html", async (t, o) => {
    if (!l(t))
      return { success: !1, error: "Origen de IPC no autorizado." };
    const n = J(o);
    if (!n)
      return { success: !1, error: "Contenido o impresora inválidos para impresión." };
    if (n.deviceName && !(await t.sender.getPrintersAsync()).some((m) => m.name === n.deviceName))
      return { success: !1, error: "La impresora indicada no está instalada." };
    const i = 15e3, c = new T({
      show: !1,
      width: 420,
      height: 700,
      webPreferences: {
        sandbox: !0,
        contextIsolation: !0,
        nodeIntegration: !1,
        javascript: !1,
        partition: "ephemeral-print"
      }
    });
    c.webContents.on("will-navigate", (p) => p.preventDefault()), c.webContents.on("will-redirect", (p) => p.preventDefault()), c.webContents.setWindowOpenHandler(() => ({ action: "deny" })), d || (c.webContents.session.webRequest.onBeforeRequest(
      { urls: ["http://*/*", "https://*/*", "ws://*/*", "wss://*/*", "file://*/*"] },
      (p, m) => m({ cancel: !0 })
    ), d = !0);
    try {
      return await new Promise((p) => {
        let m = !1;
        const h = (P) => {
          m || (m = !0, clearTimeout(w), p(P));
        }, w = setTimeout(() => {
          h({
            success: !1,
            error: `Tiempo de espera agotado (${i}ms) al imprimir ticket.`
          });
        }, i);
        c.webContents.once("did-fail-load", (P, D, F) => {
          h({
            success: !1,
            error: F || "No se pudo cargar la plantilla de impresión."
          });
        }), c.webContents.once("did-finish-load", () => {
          if (m || c.isDestroyed()) {
            h({
              success: !1,
              error: "La ventana de impresión se cerró antes de completar la impresión."
            });
            return;
          }
          c.webContents.print(
            {
              silent: !0,
              printBackground: !0,
              deviceName: n.deviceName || "",
              margins: { marginType: "none" }
            },
            (P, D) => {
              h(
                P ? { success: !0 } : { success: !1, error: D || "No fue posible imprimir." }
              );
            }
          );
        }), c.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(n.html)}`).catch((P) => {
          h({
            success: !1,
            error: P instanceof Error ? P.message : "Error cargando ticket HTML."
          });
        });
      });
    } finally {
      c.isDestroyed() || c.destroy();
    }
  }), u.removeHandler("printer:open-usb-cash-drawer"), u.handle("printer:open-usb-cash-drawer", async (t, o) => {
    if (!l(t))
      return { success: !1, error: "Origen de IPC no autorizado." };
    const n = Q(o);
    return n ? (await t.sender.getPrintersAsync()).some((c) => c.name === n.deviceName) ? await re(n.deviceName, n.timeoutMs) : { success: !1, error: "La impresora USB indicada no está instalada." } : { success: !1, error: "Nombre de impresora USB inválido." };
  }), k(), u.removeHandler("auth:set-token"), u.handle("auth:set-token", (t, o) => !y(t) || !r || typeof o != "string" || o.length < 16 || o.length > 8192 ? !1 : (E.isEncryptionAvailable() ? a = E.encryptString(o) : a = Buffer.from(o, "utf-8"), !0)), u.removeHandler("auth:clear-token"), u.handle("auth:clear-token", (t) => {
    y(t) && (a = null);
  }), u.removeHandler("auth:has-token"), u.handle(
    "auth:has-token",
    (t) => y(t) && a !== null
  ), N.defaultSession.webRequest.onBeforeSendHeaders((t, o) => {
    const n = t.webContentsId === (f == null ? void 0 : f.webContents.id);
    let i = !1;
    if (r)
      try {
        i = new URL(t.url).origin === r;
      } catch {
        i = !1;
      }
    if (a && n && i)
      try {
        let c = "";
        E.isEncryptionAvailable() ? c = E.decryptString(a) : c = a.toString("utf-8"), !!t.requestHeaders.Authorization || !!t.requestHeaders.authorization || (t.requestHeaders.Authorization = `Bearer ${c}`);
      } catch (c) {
        console.error("[Main] Error desencriptando token:", c);
      }
    o({ requestHeaders: t.requestHeaders });
  }), N.defaultSession.webRequest.onHeadersReceived((t, o) => {
    if (!(t.webContentsId === (f == null ? void 0 : f.webContents.id)) || t.resourceType !== "mainFrame") {
      o({ responseHeaders: t.responseHeaders });
      return;
    }
    const i = {
      ...t.responseHeaders ?? {}
    };
    for (const c of Object.keys(i))
      c.toLowerCase() === "content-security-policy" && delete i[c];
    i["Content-Security-Policy"] = [s], o({ responseHeaders: i });
  });
});
export {
  Ie as MAIN_DIST,
  x as RENDERER_DIST,
  R as VITE_DEV_SERVER_URL
};
