import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("printAPI", {
  printSilent: () => ipcRenderer.send("print-silent"),
});

contextBridge.exposeInMainWorld("authAPI", {
  setToken: (token: string, apiUrl: string) =>
    ipcRenderer.send("set-secure-token", token, apiUrl),
  clearToken: () => ipcRenderer.send("clear-secure-token"),
});
