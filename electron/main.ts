import {
  app,
  BrowserWindow,
  ipcMain,
  safeStorage,
  session,
  type IpcMainInvokeEvent,
} from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  testNetworkPrinter,
  printNetworkRaw,
  openDrawerViaNetwork,
} from './printerNetwork'
import {
  configuredApiOrigin,
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

const apiOrigin = configuredApiOrigin(import.meta.env.VITE_API_BASE_URL)

function isTrustedIpcSender(event: IpcMainInvokeEvent): boolean {
  return Boolean(
    win &&
      !win.isDestroyed() &&
      event.sender === win.webContents &&
      event.senderFrame === win.webContents.mainFrame,
  )
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
  let encryptedToken: Buffer | null = null

  const canUsePrinterCapabilities = (event: IpcMainInvokeEvent) =>
    isTrustedIpcSender(event) && encryptedToken !== null

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

    return await new Promise<{ success: boolean; error?: string }>((resolve) => {
      event.sender.print(
        {
          silent: true,
          printBackground: true,
          deviceName: deviceName || '',
          margins: { marginType: 'none' },
        },
        (success, failureReason) => {
          resolve(
            success
              ? { success: true }
              : { success: false, error: failureReason || 'No fue posible imprimir.' },
          )
        },
      )
    })
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
        details.requestHeaders['Authorization'] = `Bearer ${tokenStr}`;
      } catch (e) {
        console.error("[Main] Error desencriptando token:", e);
      }
    }
    callback({ requestHeaders: details.requestHeaders });
  });
})
