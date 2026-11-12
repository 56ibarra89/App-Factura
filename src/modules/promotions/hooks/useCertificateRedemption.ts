import { useCallback } from "react";
import type {
  OrderItem,
  OrderItemInput,
} from "../../orders";
import type {
  RedeemableCertificate,
} from "../model/promotion.types";
import type { Category } from "../../catalog";

interface UseCertificateRedemptionOptions {
  categories: Category[];
  cart: OrderItem[];
  addItem(item: OrderItemInput): void;
}

const normalizeSerial = (serial: string) =>
  serial.trim().toUpperCase();

export function useCertificateRedemption({
  categories,
  cart,
  addItem,
}: UseCertificateRedemptionOptions) {
  return useCallback(
    (certificate: RedeemableCertificate) => {
      const normalizedSerial = normalizeSerial(certificate.serial);
      const alreadyApplied = cart.some(
        (item) =>
          normalizeSerial(item.certificateSerial ?? "") ===
            normalizedSerial ||
          item.note?.trim().toUpperCase() ===
            `VALE: ${normalizedSerial}`,
      );

      if (alreadyApplied) return;

      const products = categories.flatMap(
        (category) => category.items,
      );
      certificate.items.forEach((certificateItem) => {
        const product = products.find(
          (candidate) =>
            candidate.id === certificateItem.productId,
        );

        addItem({
          productId: certificateItem.productId,
          name:
            product?.name ??
            `Producto ${certificateItem.productId}`,
          price: 0,
          size: "único",
          extras: [],
          note: `Vale: ${certificate.serial}`,
          giftQuantity: certificateItem.quantity,
          certificateSerial: certificate.serial,
        });
      });
    },
    [addItem, cart, categories],
  );
}
