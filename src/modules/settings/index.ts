export {
  companyConfigGateway,
} from "./api/companyConfigGateway";
export type {
  CompanyConfigGateway,
} from "./api/companyConfigGateway";
export {
  generalConfigGateway,
} from "./api/generalConfigGateway";
export type {
  GeneralConfigGateway,
} from "./api/generalConfigGateway";
export {
  taxConfigGateway,
} from "./api/taxConfigGateway";
export type {
  TaxConfigGateway,
} from "./api/taxConfigGateway";
export { useCompanySettings } from "./hooks/useCompanySettings";
export { useGeneralSettings } from "./hooks/useGeneralSettings";
export { useTaxConfig } from "./hooks/useTaxConfig";
export type {
  EmpresaConfigState,
  GeneralConfigState,
  Tax,
  TaxConfig,
} from "./model/settings.types";
