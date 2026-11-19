import type { EmpresaConfigState } from "../model/settings.types";
import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../../../shared/api";

const COMPANY_CONFIG_KEY = "empresa_config";

export interface CompanyConfigGateway {
  load(): Promise<EmpresaConfigState | null>;
  save(config: EmpresaConfigState): Promise<void>;
}

export function createCompanyConfigGateway(
  runtime: RuntimeConfigGateway,
): CompanyConfigGateway {
  return {
    async load() {
      return runtime.get<EmpresaConfigState>(COMPANY_CONFIG_KEY);
    },

    save: (config) => runtime.save(COMPANY_CONFIG_KEY, config),
  };
}

export const companyConfigGateway =
  createCompanyConfigGateway(runtimeConfigGateway);
