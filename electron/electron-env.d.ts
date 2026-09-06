/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

interface ElectronSystemPrinter {
  name: string;
  displayName: string;
  description: string;
  status: number;
  isDefault: boolean;
  options?: Record<string, string>;
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  printAPI?: {
    printSilent: (options?: { deviceName?: string }) => void;
    getSystemPrinters: () => Promise<ElectronSystemPrinter[]>;
    testNetworkPrinter: (options: {
      host: string;
      port?: number;
      timeoutMs?: number;
    }) => Promise<{ success: boolean; latencyMs?: number; error?: string }>;
    printNetworkRaw: (options: {
      host: string;
      port?: number;
      data: string | number[] | Uint8Array;
      timeoutMs?: number;
    }) => Promise<{ success: boolean; error?: string }>;
    openCashDrawer: (options?: {
      host?: string;
      port?: number;
      deviceName?: string;
    }) => Promise<{ success: boolean; error?: string }>;
  };
  authAPI?: {
    setToken: (token: string, apiUrl: string) => void;
    clearToken: () => void;
  };
}
