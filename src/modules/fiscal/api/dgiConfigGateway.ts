import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../../../shared/api";
import type { DgiConfig } from "../model/fiscal.types";

const DGI_CONFIG_KEY = "dgi_resolution";

export interface DgiConfigGateway {
  load(): Promise<DgiConfig | null>;
  save(config: DgiConfig): Promise<void>;
}

export function createDgiConfigGateway(
  runtimeGateway: RuntimeConfigGateway = runtimeConfigGateway,
): DgiConfigGateway {
  return {
    load: () => runtimeGateway.get<DgiConfig>(DGI_CONFIG_KEY),
    save: (config) => runtimeGateway.save(DGI_CONFIG_KEY, config),
  };
}

export const dgiConfigGateway = createDgiConfigGateway();
