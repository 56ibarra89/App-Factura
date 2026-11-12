import { localStore } from "../storage/storage";

export type ThemePreference = "light" | "dark";

const THEME_STORAGE_KEY = "appfactura_theme";
const THEME_UPDATED_EVENT = "appfactura:theme-updated";

export function getThemePreference(): ThemePreference {
  return (localStore.getItem(THEME_STORAGE_KEY) as ThemePreference) || "light";
}

export function setThemePreference(theme: ThemePreference): void {
  localStore.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(THEME_UPDATED_EVENT, { detail: { theme } }));
}
