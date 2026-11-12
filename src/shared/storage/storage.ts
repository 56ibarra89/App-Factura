import type { IKeyValueStorage } from "./storage.types";

function createMemoryStorage(): IKeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
  };
}

function tryGetGlobalStorage(name: "localStorage" | "sessionStorage"): Storage | null {
  try {
    const storage = (globalThis as unknown as Record<string, unknown>)[name];
    return storage && typeof storage === "object" ? (storage as Storage) : null;
  } catch {
    return null;
  }
}

function createWebStorageAdapter(storage: Storage): IKeyValueStorage {
  return {
    getItem: (key) => {
      try {
        return storage.getItem(key);
      } catch (e) {
        console.error(`[storage] getItem failed (${key})`, e);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        storage.setItem(key, value);
      } catch (e) {
        console.error(`[storage] setItem failed (${key})`, e);
      }
    },
    removeItem: (key) => {
      try {
        storage.removeItem(key);
      } catch (e) {
        console.error(`[storage] removeItem failed (${key})`, e);
      }
    },
    clear: () => {
      try {
        storage.clear();
      } catch (e) {
        console.error("[storage] clear failed", e);
      }
    },
  };
}

export function getLocalStorage(): IKeyValueStorage {
  const storage = tryGetGlobalStorage("localStorage");
  return storage ? createWebStorageAdapter(storage) : createMemoryStorage();
}

export function getSessionStorage(): IKeyValueStorage {
  const storage = tryGetGlobalStorage("sessionStorage");
  return storage ? createWebStorageAdapter(storage) : createMemoryStorage();
}

export const localStore: IKeyValueStorage = getLocalStorage();
export const sessionStore: IKeyValueStorage = getSessionStorage();

export function tryGetJson<T>(storage: IKeyValueStorage, key: string): T | null {
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson(storage: IKeyValueStorage, key: string, value: unknown): void {
  storage.setItem(key, JSON.stringify(value));
}
