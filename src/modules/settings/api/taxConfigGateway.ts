import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../../../shared/api";
import type { TaxConfig } from "../model/settings.types";

const TAX_CONFIG_KEY = "app_factura_tax_config";

export interface TaxConfigGateway {
  load(): Promise<TaxConfig | null>;
  save(config: TaxConfig): Promise<void>;
}

export function createTaxConfigGateway(
  runtimeGateway: RuntimeConfigGateway = runtimeConfigGateway,
): TaxConfigGateway {
  return {
    load: () => runtimeGateway.get<TaxConfig>(TAX_CONFIG_KEY),
    save: (config) => runtimeGateway.save(TAX_CONFIG_KEY, config),
  };
}

export const taxConfigGateway = createTaxConfigGateway();
