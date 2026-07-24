import type { PackagingSizeConfig } from "./product";

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
}

export interface EmpresaConfigState {
  logoUrl: string;
  businessName: string;
  address: string;
  phone: string;
  ticketFooter: string;
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
};

export const DEFAULT_EMPRESA_CONFIG: EmpresaConfigState = {
  logoUrl: "",
  businessName: "Mi Negocio",
  address: "Av. Principal 123, Ciudad",
  phone: "+1 234 567 8900",
  ticketFooter: "¡Gracias por su compra! Vuelva pronto.",
};

export const DEFAULT_DELIVERY_PRICES = [
  "30.00",
  "50.00",
  "",
  "",
  "",
  "",
] as const;

export const DEFAULT_PACKAGING_SIZES: PackagingSizeConfig[] = [
  { name: "familiar", price: 0 },
  { name: "mediana", price: 0 },
  { name: "personal", price: 0 },
  { name: "único", price: 0 },
];
