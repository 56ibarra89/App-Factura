export { useAutomaticPromotions } from "./hooks/useAutomaticPromotions";
export { useCertificateRedemption } from "./hooks/useCertificateRedemption";
export { default as CertificadoDialog } from "./ui/CertificadoDialog";
export { default as PromocionesSelector } from "./ui/PromocionesSelector";
export type {
  AppliedPromotion,
  PromotionSource,
  CertificadoInput,
  CertificadoRule,
  CuponFormOutput,
  CuponRule,
  CuponStatus,
  DescuentoRule,
  HappyHourRule,
  RedeemableCertificate,
  RedeemableCertificateItem,
} from "./model/promotion.types";
