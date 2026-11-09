"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("printAPI", {
  printSilent: (options) => electron.ipcRenderer.invoke("printer:print-current-page", options),
  getSystemPrinters: () => electron.ipcRenderer.invoke("printer:list-system"),
  testNetworkPrinter: (options) => electron.ipcRenderer.invoke("printer:test-network", options),
  printNetworkTicket: (options) => electron.ipcRenderer.invoke("printer:print-ticket", options),
  openNetworkCashDrawer: (options) => electron.ipcRenderer.invoke("printer:open-network-drawer", options)
});
electron.contextBridge.exposeInMainWorld("authAPI", {
  setToken: (token) => electron.ipcRenderer.invoke("auth:set-token", token),
  clearToken: () => electron.ipcRenderer.invoke("auth:clear-token"),
  hasToken: () => electron.ipcRenderer.invoke("auth:has-token")
});
