"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("printAPI", {
  printSilent: (options) => electron.ipcRenderer.invoke("printer:print-current-page", options),
  getSystemPrinters: () => electron.ipcRenderer.invoke("printer:list-system"),
  testNetworkPrinter: (options) => electron.ipcRenderer.invoke("printer:test-network", options),
  printNetworkTicket: (options) => electron.ipcRenderer.invoke("printer:print-ticket", options),
  openNetworkCashDrawer: (options) => electron.ipcRenderer.invoke("printer:open-network-drawer", options),
  printHtml: (options) => electron.ipcRenderer.invoke("printer:print-html", options),
  openUsbCashDrawer: (options) => electron.ipcRenderer.invoke("printer:open-usb-cash-drawer", options)
});
electron.contextBridge.exposeInMainWorld("authAPI", {
  setToken: (token) => electron.ipcRenderer.invoke("auth:set-token", token),
  clearToken: () => electron.ipcRenderer.invoke("auth:clear-token"),
  hasToken: () => electron.ipcRenderer.invoke("auth:has-token")
});
electron.contextBridge.exposeInMainWorld("runtimeConfig", {
  getApiBaseUrlSync: () => {
    const value = electron.ipcRenderer.sendSync("config:get-api-base-url-sync");
    return typeof value === "string" ? value : "";
  },
  getApiBaseUrl: () => electron.ipcRenderer.invoke("config:get-api-base-url")
});
