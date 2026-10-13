import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("printAPI", {
  printSilent: (options?: { deviceName?: string }) =>
    ipcRenderer.invoke("printer:print-current-page", options),
  getSystemPrinters: () => ipcRenderer.invoke("printer:list-system"),
  testNetworkPrinter: (options: { host: string; port?: number; timeoutMs?: number }) =>
    ipcRenderer.invoke("printer:test-network", options),
  printNetworkTicket: (options: {
    host: string;
    port?: number;
    data: number[] | Uint8Array;
    timeoutMs?: number;
  }) => ipcRenderer.invoke("printer:print-ticket", options),
  openNetworkCashDrawer: (options: {
    host: string;
    port?: number;
    timeoutMs?: number;
  }) => ipcRenderer.invoke("printer:open-network-drawer", options),
});

contextBridge.exposeInMainWorld("authAPI", {
  setToken: (token: string) => ipcRenderer.invoke("auth:set-token", token),
  clearToken: () => ipcRenderer.invoke("auth:clear-token"),
  hasToken: () => ipcRenderer.invoke("auth:has-token"),
});
