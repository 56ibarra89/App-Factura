import type { IKeyValueStorage } from "../../types/storage.types";
import { localStore } from "../storage/storage";
import {
  setThemePreference,
  type ThemePreference,
} from "../themePreference";

const REMEMBERED_USER_KEY = "rememberedUser";

export interface AuthPreferencesGateway {
  applyTheme(theme: ThemePreference): void;
  rememberUsername(
    username: string,
    remember: boolean,
  ): void;
}

export function createAuthPreferencesGateway(
  storage: IKeyValueStorage = localStore,
  applyTheme: (theme: ThemePreference) => void =
    setThemePreference,
): AuthPreferencesGateway {
  return {
    applyTheme,

    rememberUsername(username, remember) {
      if (remember) {
        storage.setItem(REMEMBERED_USER_KEY, username);
        return;
      }
      storage.removeItem(REMEMBERED_USER_KEY);
    },
  };
}

export const authPreferencesGateway =
  createAuthPreferencesGateway();
