import { app, BrowserWindow, ipcMain, safeStorage, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  testNetworkPrinter,
  printNetworkRaw,
  openDrawerViaNetwork,
} from './printerNetwork'

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
  // 1. Manejador de Impresión Silenciosa (USB / Driver de Windows)
  ipcMain.removeAllListeners('print-silent');
  ipcMain.on('print-silent', (event, options?: { deviceName?: string }) => {
    event.sender.print(
      {
        silent: true,
        printBackground: true,
        deviceName: options?.deviceName || '',
        margins: { marginType: 'none' },
      },
      (success, failureReason) => {
        if (!success) {
          console.error(
            'Error al imprimir silencioso en',
            options?.deviceName || 'impresora predeterminada:',
            failureReason,
          )
        }
      },
    )
  })

  // 2. Detección de Impresoras del Sistema (Windows Spooler)
  ipcMain.removeHandler('get-system-printers');
  ipcMain.handle('get-system-printers', async (event) => {
    try {
      const printers = await event.sender.getPrintersAsync();
      return printers;
    } catch (error) {
      console.error('[Main] Error obteniendo impresoras del sistema:', error);
      return [];
    }
  });

  // 3. Prueba de Conexión LAN (Ping TCP al puerto 9100)
  ipcMain.removeHandler('test-network-printer');
  ipcMain.handle(
    'test-network-printer',
    async (
      _event,
      options: { host: string; port?: number; timeoutMs?: number },
    ) => {
      return await testNetworkPrinter(
        options.host,
        options.port,
        options.timeoutMs,
      );
    },
  );

  // 4. Impresión Directa por Red (Socket TCP RAW 9100)
  ipcMain.removeHandler('print-network-raw');
  ipcMain.handle(
    'print-network-raw',
    async (
      _event,
      options: {
        host: string;
        port?: number;
        data: string | number[] | Uint8Array;
        timeoutMs?: number;
      },
    ) => {
      return await printNetworkRaw(
        options.host,
        options.port,
        options.data,
        options.timeoutMs,
      );
    },
  );

  // 5. Apertura de Gaveta de Dinero (Pulso RJ11)
  ipcMain.removeHandler('open-cash-drawer');
  ipcMain.handle(
    'open-cash-drawer',
    async (
      _event,
      options?: { host?: string; port?: number; deviceName?: string },
    ) => {
      if (options?.host) {
        return await openDrawerViaNetwork(options.host, options.port);
      }
      return { success: true };
    },
  );

  createWindow();

  let encryptedToken: Buffer | null = null;
  let targetApiOrigin: string | null = null;

  ipcMain.removeHandler('set-secure-token');
  ipcMain.handle('set-secure-token', (event, token: string, apiUrl: string) => {
    if (event.sender !== win?.webContents) return false;
    if (typeof token !== 'string' || token.length < 16 || token.length > 8192) {
      return false;
    }
    let apiOrigin: string;
    try {
      const parsed = new URL(apiUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) return false;
      apiOrigin = parsed.origin;
    } catch {
      return false;
    }

    if (safeStorage.isEncryptionAvailable()) {
      encryptedToken = safeStorage.encryptString(token);
    } else {
      encryptedToken = Buffer.from(token, 'utf-8');
    }
    targetApiOrigin = apiOrigin;
    return true;
  });

  ipcMain.removeHandler('clear-secure-token');
  ipcMain.handle('clear-secure-token', (event) => {
    if (event.sender !== win?.webContents) return;
    encryptedToken = null;
    targetApiOrigin = null;
  });

  ipcMain.removeHandler('has-secure-token');
  ipcMain.handle('has-secure-token', (event) =>
    event.sender === win?.webContents && encryptedToken !== null,
  );

  // Interceptar peticiones para inyectar el token
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const belongsToAppWindow = details.webContentsId === win?.webContents.id
    let matchesApiOrigin = false;
    if (targetApiOrigin) {
      try {
        matchesApiOrigin = new URL(details.url).origin === targetApiOrigin;
      } catch {
        matchesApiOrigin = false;
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
