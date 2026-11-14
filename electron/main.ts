import {
  app,
  BrowserWindow,
  ipcMain,
  safeStorage,
  session,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
} from 'electron'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  testNetworkPrinter,
  printNetworkRaw,
  openDrawerViaNetwork,
} from './printerNetwork'
import {
  openDrawerViaWindowsUsb,
  parsePrintHtmlRequest,
  parseUsbPrinterRequest,
} from './printerWindowsRaw'
import {
  buildElectronCspHeader,
  configuredApiOrigin,
  resolveRuntimeApiBaseUrl,
  validateDeviceName,
  validatePrintPayload,
  validatePrinterTarget,
} from './ipcSecurity'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function isTrustedIpcSender(
  event: Pick<IpcMainInvokeEvent | IpcMainEvent, 'sender' | 'senderFrame'>,
): boolean {
  return Boolean(
    win &&
      !win.isDestroyed() &&
      event.sender === win.webContents &&
      event.senderFrame === win.webContents.mainFrame,
  )
}

function loadRuntimeApiBaseUrl(): string | null {
  const configFilePath = path.join(app.getPath('userData'), 'runtime-config.json')
  let configFileContent: string | null = null
  try {
    if (fs.existsSync(configFilePath)) {
      configFileContent = fs.readFileSync(configFilePath, 'utf8')
    }
  } catch (error) {
    console.warn('[Main] No se pudo leer runtime-config.json:', error)
  }

  return resolveRuntimeApiBaseUrl({
    env: process.env,
    configFileContent,
    builtInUrl: import.meta.env.VITE_API_BASE_URL,
  })
}

const deniedIpcResult = {
  success: false,
  error: 'Operación nativa no autorizada.',
} as const

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Remover el menú por defecto (File, Edit, View, Window, Help)
  win.setMenu(null)
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    const currentUrl = win?.webContents.getURL()
    if (!currentUrl) return
    try {
      if (new URL(navigationUrl).origin !== new URL(currentUrl).origin) {
        event.preventDefault()
      }
    } catch {
      event.preventDefault()
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  const runtimeApiBaseUrl = loadRuntimeApiBaseUrl()
  const apiOrigin = configuredApiOrigin(runtimeApiBaseUrl ?? undefined)
  const cspHeaderValue = buildElectronCspHeader(apiOrigin)
  let encryptedToken: Buffer | null = null
  let printSessionProtected = false

  const canUsePrinterCapabilities = (event: IpcMainInvokeEvent) =>
    isTrustedIpcSender(event) && encryptedToken !== null

  ipcMain.removeAllListeners('config:get-api-base-url-sync')
  ipcMain.on('config:get-api-base-url-sync', (event) => {
    event.returnValue = isTrustedIpcSender(event) ? (runtimeApiBaseUrl ?? '') : ''
  })

  ipcMain.removeHandler('config:get-api-base-url')
  ipcMain.handle('config:get-api-base-url', (event) =>
    isTrustedIpcSender(event) ? (runtimeApiBaseUrl ?? '') : '',
  )

  // 1. Manejador de Impresión Silenciosa (USB / Driver de Windows)
  ipcMain.removeHandler('printer:print-current-page')
  ipcMain.handle('printer:print-current-page', async (event, options: unknown) => {
    if (!canUsePrinterCapabilities(event)) return deniedIpcResult

    const deviceName = validateDeviceName(options)
    if (deviceName === null) {
      return { success: false, error: 'Impresora no válida.' }
    }

    if (deviceName) {
      const printers = await event.sender.getPrintersAsync()
      if (!printers.some((printer) => printer.name === deviceName)) {
        return { success: false, error: 'La impresora indicada no está instalada.' }
      }
    }

    if (event.sender.isDestroyed()) {
      return {
        success: false,
        error: 'La ventana de impresión se cerró antes de completar la impresión.',
      };
    }

    const PRINT_TIMEOUT_MS = 15000;
    return await new Promise<{ success: boolean; error?: string }>((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({
          success: false,
          error: `Tiempo de espera agotado (${PRINT_TIMEOUT_MS}ms) al imprimir.`,
        });
      }, PRINT_TIMEOUT_MS);

      try {
        event.sender.print(
          {
            silent: true,
            printBackground: true,
            deviceName: deviceName || '',
            margins: { marginType: 'none' },
          },
          (success, failureReason) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(
              success
                ? { success: true }
                : { success: false, error: failureReason || 'No fue posible imprimir.' },
            );
          },
        );
      } catch (err) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({
          success: false,
          error: err instanceof Error ? err.message : 'Error inesperado al imprimir.',
        });
      }
    });
  })

  // 2. Detección de Impresoras del Sistema (Windows Spooler)
  ipcMain.removeHandler('printer:list-system')
  ipcMain.handle('printer:list-system', async (event) => {
    if (!canUsePrinterCapabilities(event)) return []
    try {
      const printers = await event.sender.getPrintersAsync()
      return printers.map(({ name, displayName, description, options }) => {
        const safeOptions = options as Record<string, unknown>
        const rawStatus = safeOptions.status ?? safeOptions['printer-status']
        const status = Number.isFinite(Number(rawStatus)) ? Number(rawStatus) : 0
        const rawDefault = safeOptions.isDefault ?? safeOptions['is-default']
        const isDefault = rawDefault === true || rawDefault === 'true'
        return { name, displayName, description, status, isDefault }
      })
    } catch (error) {
      console.error('[Main] Error obteniendo impresoras del sistema:', error)
      return []
    }
  })

  // 3. Prueba de Conexión LAN (Ping TCP al puerto 9100)
  ipcMain.removeHandler('printer:test-network')
  ipcMain.handle(
    'printer:test-network',
    async (event, options: unknown) => {
      if (!canUsePrinterCapabilities(event)) return deniedIpcResult
      const target = validatePrinterTarget(options)
      if (!target) {
        return {
          success: false,
          error: 'Solo se permiten impresoras IPv4 privadas en puertos 9100-9109.',
        }
      }
      return await testNetworkPrinter(
        target.host,
        target.port,
        target.timeoutMs,
      )
    },
  )

  // 4. Impresión Directa por Red (Socket TCP RAW 9100)
  ipcMain.removeHandler('printer:print-ticket')
  ipcMain.handle(
    'printer:print-ticket',
    async (event, options: unknown) => {
      if (!canUsePrinterCapabilities(event)) return deniedIpcResult
      const target = validatePrinterTarget(options)
      const payload =
        typeof options === 'object' && options !== null && 'data' in options
          ? validatePrintPayload(options.data)
          : null
      if (!target || !payload) {
        return { success: false, error: 'Destino o contenido de impresión no válido.' }
      }
      return await printNetworkRaw(
        target.host,
        target.port,
        payload,
        target.timeoutMs,
      )
    },
  )

  // 5. Apertura de Gaveta de Dinero (Pulso RJ11)
  ipcMain.removeHandler('printer:open-network-drawer')
  ipcMain.handle(
    'printer:open-network-drawer',
    async (event, options: unknown) => {
      if (!canUsePrinterCapabilities(event)) return deniedIpcResult
      const target = validatePrinterTarget(options)
      if (!target) {
        return { success: false, error: 'Destino de gaveta no válido.' }
      }
      return await openDrawerViaNetwork(
        target.host,
        target.port,
        target.timeoutMs,
      )
    },
  )

  ipcMain.removeHandler('printer:print-html')
  ipcMain.handle('printer:print-html', async (event, payload: unknown) => {
    if (!canUsePrinterCapabilities(event)) {
      return { success: false, error: 'Origen de IPC no autorizado.' }
    }
    const parsed = parsePrintHtmlRequest(payload)
    if (!parsed) {
      return { success: false, error: 'Contenido o impresora inválidos para impresión.' }
    }

    const PRINT_TIMEOUT_MS = 15000
    const printWin = new BrowserWindow({
      show: false,
      width: 420,
      height: 700,
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        javascript: false,
        partition: 'ephemeral-print',
      },
    })
    printWin.webContents.on('will-navigate', (navigationEvent) => navigationEvent.preventDefault())
    printWin.webContents.on('will-redirect', (navigationEvent) => navigationEvent.preventDefault())
    printWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    if (!printSessionProtected) {
      printWin.webContents.session.webRequest.onBeforeRequest(
        { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*', 'file://*/*'] },
        (_details, callback) => callback({ cancel: true }),
      )
      printSessionProtected = true
    }

    try {
      return await new Promise<{ success: boolean; error?: string }>((resolve) => {
        let settled = false
        const settle = (result: { success: boolean; error?: string }) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolve(result)
        }
        const timer = setTimeout(() => {
          settle({
            success: false,
            error: `Tiempo de espera agotado (${PRINT_TIMEOUT_MS}ms) al imprimir ticket.`,
          })
        }, PRINT_TIMEOUT_MS)

        printWin.webContents.once('did-fail-load', (_e, _errCode, errDesc) => {
          settle({
            success: false,
            error: errDesc || 'No se pudo cargar la plantilla de impresión.',
          })
        })

        printWin.webContents.once('did-finish-load', () => {
          if (settled || printWin.isDestroyed()) {
            settle({
              success: false,
              error: 'La ventana de impresión se cerró antes de completar la impresión.',
            })
            return
          }
          printWin.webContents.print(
            {
              silent: true,
              printBackground: true,
              deviceName: parsed.deviceName || '',
              margins: { marginType: 'none' },
            },
            (success, failureReason) => {
              settle(
                success
                  ? { success: true }
                  : { success: false, error: failureReason || 'No fue posible imprimir.' },
              )
            },
          )
        })

        void printWin
          .loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(parsed.html)}`)
          .catch((err) => {
            settle({
              success: false,
              error: err instanceof Error ? err.message : 'Error cargando ticket HTML.',
            })
          })
      })
    } finally {
      if (!printWin.isDestroyed()) {
        printWin.destroy()
      }
    }
  })

  ipcMain.removeHandler('printer:open-usb-cash-drawer')
  ipcMain.handle('printer:open-usb-cash-drawer', async (event, options: unknown) => {
    if (!canUsePrinterCapabilities(event)) {
      return { success: false, error: 'Origen de IPC no autorizado.' }
    }
    const parsed = parseUsbPrinterRequest(options)
    if (!parsed) {
      return { success: false, error: 'Nombre de impresora USB inválido.' }
    }
    return await openDrawerViaWindowsUsb(parsed.deviceName, parsed.timeoutMs)
  })

  createWindow()

  ipcMain.removeHandler('auth:set-token')
  ipcMain.handle('auth:set-token', (event, token: string) => {
    if (!isTrustedIpcSender(event) || !apiOrigin) return false
    if (typeof token !== 'string' || token.length < 16 || token.length > 8192) {
      return false
    }

    if (safeStorage.isEncryptionAvailable()) {
      encryptedToken = safeStorage.encryptString(token)
    } else {
      encryptedToken = Buffer.from(token, 'utf-8')
    }
    return true
  })

  ipcMain.removeHandler('auth:clear-token')
  ipcMain.handle('auth:clear-token', (event) => {
    if (!isTrustedIpcSender(event)) return
    encryptedToken = null
  })

  ipcMain.removeHandler('auth:has-token')
  ipcMain.handle('auth:has-token', (event) =>
    isTrustedIpcSender(event) && encryptedToken !== null,
  )

  // Interceptar peticiones para inyectar el token
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const belongsToAppWindow = details.webContentsId === win?.webContents.id
    let matchesApiOrigin = false;
    if (apiOrigin) {
      try {
        matchesApiOrigin = new URL(details.url).origin === apiOrigin
      } catch {
        matchesApiOrigin = false
      }
    }
    if (encryptedToken && belongsToAppWindow && matchesApiOrigin) {
      try {
        let tokenStr = '';
        if (safeStorage.isEncryptionAvailable()) {
          tokenStr = safeStorage.decryptString(encryptedToken);
        } else {
          tokenStr = encryptedToken.toString('utf-8');
        }
        const hasAuthHeader =
          Boolean(details.requestHeaders['Authorization']) ||
          Boolean(details.requestHeaders['authorization']);
        if (!hasAuthHeader) {
          details.requestHeaders['Authorization'] = `Bearer ${tokenStr}`;
        }
      } catch (e) {
        console.error("[Main] Error desencriptando token:", e);
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const belongsToAppWindow = details.webContentsId === win?.webContents.id
    if (!belongsToAppWindow || details.resourceType !== 'mainFrame') {
      callback({ responseHeaders: details.responseHeaders })
      return
    }

    const updatedHeaders: Record<string, string | string[]> = {
      ...(details.responseHeaders ?? {}),
    }
    for (const key of Object.keys(updatedHeaders)) {
      if (key.toLowerCase() === 'content-security-policy') {
        delete updatedHeaders[key]
      }
    }
    updatedHeaders['Content-Security-Policy'] = [cspHeaderValue]

    callback({ responseHeaders: updatedHeaders })
  })
})
