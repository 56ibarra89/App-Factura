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
): OrderItem[] {
  const items: OrderItem[] = packagingItems.map((packaging) => ({
    id: crypto.randomUUID(),
    name: `Empaque ${packaging.name}`,
    price: packaging.price,
    size: "único",
    quantity: packaging.quantity,
    extras: [],
  }));

  if (deliveryCost && deliveryCost > 0) {
    items.push({
      id: crypto.randomUUID(),
      name: "Delivery",
      price: deliveryCost,
      size: "único",
      quantity: 1,
      extras: [],
      note: "Cargo por transporte",
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
