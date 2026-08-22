export interface GeneralConfigState {
  language: "es" | "en";
  currencyCode: string;
  currencySymbol: string;
  enableSecondaryCurrency: boolean;
  secondaryCurrencyCode: string;
  secondaryCurrencySymbol: string;
  exchangeRate: number;
  requireExactOpeningAmount: boolean;
  autoPrintReceipt: boolean;
  blindCashCount: boolean;
  cashDiscrepancyThreshold: number;
}

export interface EmpresaConfigState {
  logoUrl: string;
  businessName: string;
  address: string;
  phone: string;
  ticketFooter: string;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
}

export interface TaxConfig {
  taxes: Tax[];
  isExonerated: boolean;
}

export const DEFAULT_GENERAL_CONFIG: GeneralConfigState = {
  language: "es",
  currencyCode: "NIO",
  currencySymbol: "C$",
  enableSecondaryCurrency: true,
  secondaryCurrencyCode: "USD",
  secondaryCurrencySymbol: "$",
  exchangeRate: 36.5,
  requireExactOpeningAmount: false,
  autoPrintReceipt: true,
  blindCashCount: false,
  cashDiscrepancyThreshold: 100,
};

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  taxes: [
    {
      id: "1",
      name: "Módulo Principal de ITBMS/IVA",
      percentage: 15,
    },
  ],
  isExonerated: false,
};

export const DEFAULT_EMPRESA_CONFIG: EmpresaConfigState = {
  logoUrl: "",
  businessName: "Mi Negocio",
  address: "Av. Principal 123, Ciudad",
  phone: "+1 234 567 8900",
  ticketFooter: "¡Gracias por su compra! Vuelva pronto.",
};
