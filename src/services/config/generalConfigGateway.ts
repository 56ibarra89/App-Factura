import type { GeneralConfigState } from "../../types/config";
import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "./runtimeConfigGateway";

const GENERAL_CONFIG_KEY = "general_config";

export interface GeneralConfigGateway {
  load(): Promise<GeneralConfigState | null>;
  save(config: GeneralConfigState): Promise<void>;
}

export function createGeneralConfigGateway(
  runtime: RuntimeConfigGateway,
): GeneralConfigGateway {
  return {
    async load() {
      try {
        return await runtime.get<GeneralConfigState>(GENERAL_CONFIG_KEY);
      } catch (error) {
        console.error("Error obteniendo configuración general:", error);
        return null;
      }
    },

    save: (config) => runtime.save(GENERAL_CONFIG_KEY, config),
  };
}

export const generalConfigGateway =
  createGeneralConfigGateway(runtimeConfigGateway);
