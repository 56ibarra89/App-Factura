import { app, BrowserWindow, ipcMain, safeStorage, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
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
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Remover el menú por defecto (File, Edit, View, Window, Help)
  win.setMenu(null)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
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
  ipcMain.removeAllListeners('print-silent');
  ipcMain.on('print-silent', (event) => {
    event.sender.print({
      silent: true,
      printBackground: true,
      margins: { marginType: 'none' },
    }, (success, failureReason) => {
      if (!success) console.error('Error al imprimir:', failureReason)
    })
  })

  createWindow();

  let encryptedToken: Buffer | null = null;
  let targetApiUrl: string | null = null;

  ipcMain.removeAllListeners('set-secure-token');
  ipcMain.on('set-secure-token', (event, token: string, apiUrl: string) => {
    if (safeStorage.isEncryptionAvailable()) {
      encryptedToken = safeStorage.encryptString(token);
      targetApiUrl = apiUrl;
      console.log("[Main] Token encriptado y guardado en memoria segura.");
    } else {
      console.warn("[Main] safeStorage no disponible. Token guardado sin encriptar en memoria.");
      encryptedToken = Buffer.from(token, 'utf-8');
      targetApiUrl = apiUrl;
    }
  });

  ipcMain.removeAllListeners('clear-secure-token');
  ipcMain.on('clear-secure-token', () => {
    if (encryptedToken !== null) {
      encryptedToken = null;
      console.log("[Main] Token eliminado de memoria segura.");
    }
  });

  // Interceptar peticiones para inyectar el token
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (encryptedToken && targetApiUrl && details.url.startsWith(targetApiUrl)) {
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
