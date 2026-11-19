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
  exchangeRate: 0,
  requireExactOpeningAmount: false,
  autoPrintReceipt: true,
  blindCashCount: true,
  cashDiscrepancyThreshold: 0,
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
  businessName: "",
  address: "",
  phone: "",
  ticketFooter: "¡Gracias por su compra! Vuelva pronto.",
};
