"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("printAPI", {
  printSilent: (options) => electron.ipcRenderer.send("print-silent", options),
  getSystemPrinters: () => electron.ipcRenderer.invoke("get-system-printers"),
  testNetworkPrinter: (options) => electron.ipcRenderer.invoke("test-network-printer", options),
  printNetworkRaw: (options) => electron.ipcRenderer.invoke("print-network-raw", options),
  openCashDrawer: (options) => electron.ipcRenderer.invoke("open-cash-drawer", options)
});
electron.contextBridge.exposeInMainWorld("authAPI", {
  setToken: (token, apiUrl) => electron.ipcRenderer.send("set-secure-token", token, apiUrl),
  clearToken: () => electron.ipcRenderer.send("clear-secure-token")
});
