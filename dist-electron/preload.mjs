"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("printAPI", {
  printSilent: () => electron.ipcRenderer.send("print-silent")
});
electron.contextBridge.exposeInMainWorld("authAPI", {
  setToken: (token, apiUrl) => electron.ipcRenderer.send("set-secure-token", token, apiUrl),
  clearToken: () => electron.ipcRenderer.send("clear-secure-token")
});
