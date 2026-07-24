import { useCallback } from "react";
import { useOrderCommands } from "../context/OrderContext";
import {
  buildSupplementalCartItems,
  extractCertificateSerials,
} from "../services/checkout/checkoutDomain";
import type { CartItemType } from "../types/cart";
import type { CheckoutFormValues } from "../types/checkout";
import {
  calculateCartTotals,
  type AppliedPromotion,
} from "../utils/cartTotals";
import { useImpuestosConfig } from "./useImpuestosConfig";

export function useCheckout(
  cart: CartItemType[],
  promotion: AppliedPromotion | null,
) {
  const { taxes, isExonerated } = useImpuestosConfig();
  const { addOrder, updateOrderItems, finalizeOrder, markAsSentToKitchen } =
    useOrderCommands();

  const buildCheckoutCart = useCallback(
    (form: CheckoutFormValues) => [
      ...cart,
      ...buildSupplementalCartItems(
        form.packagingItems,
        form.orderType === "delivery" ? form.deliveryCost : undefined,
      ),
    ],
    [cart],
  );

  const confirmFactura = useCallback(
    async (form: CheckoutFormValues) => {
      const items = buildCheckoutCart(form);
      const totals = calculateCartTotals(
        items,
        taxes,
        isExonerated,
        promotion,
      );

      return addOrder({
        items,
        ...totals,
        customerName: form.customerName,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        promotionCode: promotion?.code,
        certificateSerials: extractCertificateSerials(items),
        driverId: form.driverId,
        customerTendered: form.customerTendered,
      });
    },
    [
      addOrder,
      buildCheckoutCart,
      isExonerated,
      promotion,
      taxes,
    ],
  );

  const saveTableOrder = useCallback(
    async (orderId?: string, tableId?: string) => {
      const totals = calculateCartTotals(
        cart,
        taxes,
        isExonerated,
        promotion,
      );

      if (orderId) {
        await updateOrderItems(
          orderId,
          cart,
          totals.total,
          totals.subTotal,
          totals.taxAmount,
        );
        return orderId;
      }

      return addOrder({
        items: cart,
        ...totals,
        orderType: "local",
        tableId,
        promotionCode: promotion?.code,
        certificateSerials: extractCertificateSerials(cart),
      });
    },
    [
      addOrder,
      cart,
      isExonerated,
      promotion,
      taxes,
      updateOrderItems,
    ],
  );

  const finalizeTableOrder = useCallback(
    async (orderId: string, form: CheckoutFormValues) => {
      const items = buildCheckoutCart(form);
      const totals = calculateCartTotals(
        items,
        taxes,
        isExonerated,
        promotion,
      );

      await updateOrderItems(
        orderId,
        items,
        totals.total,
        totals.subTotal,
        totals.taxAmount,
      );

      return finalizeOrder(orderId, {
        ...totals,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        customerName: form.customerName,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        promotionCode: promotion?.code,
        certificateSerials: extractCertificateSerials(items),
      });
    },
    [
      buildCheckoutCart,
      finalizeOrder,
      isExonerated,
      promotion,
      taxes,
      updateOrderItems,
    ],
  );

  return {
    confirmFactura,
    saveTableOrder,
    finalizeTableOrder,
    sendToKitchen: markAsSentToKitchen,
  };
}
