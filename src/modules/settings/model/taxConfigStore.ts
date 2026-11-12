import {
  DEFAULT_TAX_CONFIG,
  type TaxConfig,
} from "./settings.types";

type TaxConfigListener = () => void;

let currentConfig = DEFAULT_TAX_CONFIG;
let initialized = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<TaxConfigListener>();

function publish(config: TaxConfig) {
  currentConfig = config;
  listeners.forEach((listener) => listener());
}

export const taxConfigStore = {
  getSnapshot(): TaxConfig {
    return currentConfig;
  },

  subscribe(listener: TaxConfigListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  set(config: TaxConfig) {
    publish(config);
  },

  ensureLoaded(load: () => Promise<TaxConfig | null>) {
    if (initialized) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = load()
      .then((config) => {
        if (config && Array.isArray(config.taxes)) {
          publish(config);
        }
        initialized = true;
      })
      .finally(() => {
        loadPromise = null;
      });

    return loadPromise;
  },
};
