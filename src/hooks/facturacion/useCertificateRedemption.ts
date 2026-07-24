import { useCallback } from "react";
import type { CartItemInput, CartItemType } from "../../types/cart";
import type { RedeemableCertificate } from "../../types/checkout";
import type { Category } from "../../types/product";

interface UseCertificateRedemptionOptions {
  categories: Category[];
  cart: CartItemType[];
  addItem(item: CartItemInput): void;
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
