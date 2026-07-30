import type { CashRegisterConfigState } from "./cash-register.types";

type ConfigListener = () => void;

let snapshot: CashRegisterConfigState = {
  cashRegisters: [],
  shiftProfiles: [],
};
let initialized = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<ConfigListener>();

function publish(next: CashRegisterConfigState) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export const cashRegisterConfigStore = {
  getSnapshot(): CashRegisterConfigState {
    return snapshot;
  },

  subscribe(listener: ConfigListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  set(next: CashRegisterConfigState) {
    publish(next);
  },

  ensureLoaded(load: () => Promise<CashRegisterConfigState>) {
    if (initialized) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = load()
      .then((config) => {
        publish(config);
        initialized = true;
      })
      .finally(() => {
        loadPromise = null;
      });

    return loadPromise;
  },
};
