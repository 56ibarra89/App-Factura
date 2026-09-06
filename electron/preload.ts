import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("printAPI", {
  printSilent: (options?: { deviceName?: string }) =>
    ipcRenderer.send("print-silent", options),
  getSystemPrinters: () => ipcRenderer.invoke("get-system-printers"),
  testNetworkPrinter: (options: { host: string; port?: number; timeoutMs?: number }) =>
    ipcRenderer.invoke("test-network-printer", options),
  printNetworkRaw: (options: {
    host: string;
    port?: number;
    data: string | number[] | Uint8Array;
    timeoutMs?: number;
  }) => ipcRenderer.invoke("print-network-raw", options),
  openCashDrawer: (options?: { host?: string; port?: number; deviceName?: string }) =>
    ipcRenderer.invoke("open-cash-drawer", options),
});

contextBridge.exposeInMainWorld("authAPI", {
  setToken: (token: string, apiUrl: string) =>
    ipcRenderer.send("set-secure-token", token, apiUrl),
  clearToken: () => ipcRenderer.send("clear-secure-token"),
});
