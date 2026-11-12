import type {
  OrderItem,
  OrderPromotionSelection,
} from "../../orders";
import type { AppliedPromotion } from "../../promotions";
import type { PackagingItem } from "./checkout.types";

const LEGACY_CERTIFICATE_NOTE_PREFIX = "Vale: ";

export function buildOrderPromotionSelection(
  promotion: AppliedPromotion | null,
): OrderPromotionSelection {
  if (!promotion) return { promotionSource: "none" };

  switch (promotion.source) {
    case "coupon":
      return {
        promotionSource: "coupon",
        promotionCode: promotion.code,
        couponId: promotion.id,
      };
    case "discount":
      return {
        promotionSource: "discount",
        discountId: promotion.id,
      };
    case "happy-hour":
      return {
        promotionSource: "happy-hour",
        happyHourId: promotion.id,
      };
  }
}

export function buildSupplementalCartItems(
  packagingItems: readonly PackagingItem[],
  deliveryCost?: number,
  deliveryZoneName?: string,
  deliveryDriverPayout?: number,
  isFreeDelivery?: boolean,
): OrderItem[] {
  const items: OrderItem[] = packagingItems.map((packaging) => ({
    id: crypto.randomUUID(),
    name: `Empaque ${packaging.name}`,
    price: packaging.price,
    size: "único",
    quantity: packaging.quantity,
    extras: [],
    isSentToKitchen: false,
  }));

  if ((deliveryCost !== undefined && deliveryCost > 0) || isFreeDelivery) {
    const isFree = Boolean(isFreeDelivery || deliveryCost === 0);
    const noteParts: string[] = [];
    if (deliveryZoneName) {
      noteParts.push(`Zona: ${deliveryZoneName}`);
    }
    if (deliveryDriverPayout !== undefined) {
      noteParts.push(`Pago Motorizado: C$${deliveryDriverPayout.toFixed(2)}`);
    }
    if (isFree) {
      noteParts.push("Envío Gratis por Consumo Mínimo");
    }

    items.push({
      id: crypto.randomUUID(),
      name: isFree ? "Delivery (Envío Gratis)" : "Delivery",
      price: isFree ? 0 : (deliveryCost ?? 0),
      size: "único",
      quantity: 1,
      extras: [],
      note: noteParts.length > 0 ? noteParts.join(" | ") : "Cargo por transporte",
      isSentToKitchen: false,
    });
  }

  return items;
}

export function extractCertificateSerials(
  items: readonly OrderItem[],
): string[] {
  const serials = items.flatMap((item) => {
    if (item.certificateSerial) return [item.certificateSerial];
    if (!item.note?.startsWith(LEGACY_CERTIFICATE_NOTE_PREFIX)) return [];

    return [item.note.slice(LEGACY_CERTIFICATE_NOTE_PREFIX.length)];
  });

  return [
    ...new Set(
      serials.map((serial) => serial.trim().toUpperCase()).filter(Boolean),
    ),
  ];
}
