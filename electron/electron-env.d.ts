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
}

interface ElectronNativeOperationResult {
  success: boolean;
  error?: string;
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  printAPI?: {
    printSilent: (
      options?: { deviceName?: string },
    ) => Promise<ElectronNativeOperationResult>;
    getSystemPrinters: () => Promise<ElectronSystemPrinter[]>;
    testNetworkPrinter: (options: {
      host: string;
      port?: number;
      timeoutMs?: number;
    }) => Promise<{ success: boolean; latencyMs?: number; error?: string }>;
    printNetworkTicket: (options: {
      host: string;
      port?: number;
      data: number[] | Uint8Array;
      timeoutMs?: number;
    }) => Promise<ElectronNativeOperationResult>;
    openNetworkCashDrawer: (options: {
      host: string;
      port?: number;
      timeoutMs?: number;
    }) => Promise<ElectronNativeOperationResult>;
  };
  authAPI?: {
    setToken: (token: string) => Promise<boolean>;
    clearToken: () => Promise<void>;
    hasToken: () => Promise<boolean>;
  };
}
