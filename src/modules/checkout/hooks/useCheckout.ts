import { useCallback } from "react";
import {
  useOrderCommands,
  type OrderItem,
} from "../../orders";
import {
  buildSupplementalCartItems,
  buildOrderPromotionSelection,
  extractCertificateSerials,
} from "../model/checkoutDomain";
import type { CheckoutFormValues } from "../model/checkout.types";
import { calculateCartTotals } from "../model/cartTotals";
import type {
  AppliedPromotion,
} from "../../promotions";
import { useTaxConfig } from "../../settings";

export function useCheckout(
  cart: OrderItem[],
  promotion: AppliedPromotion | null,
) {
  const { taxes, isExonerated } = useTaxConfig();
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
        customerId: form.customerId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        ...buildOrderPromotionSelection(promotion),
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
          totals.discountAmount,
          buildOrderPromotionSelection(promotion),
        );
        return orderId;
      }

      return addOrder({
        items: cart,
        ...totals,
        orderType: "local",
        tableId,
        ...buildOrderPromotionSelection(promotion),
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
        totals.discountAmount,
        buildOrderPromotionSelection(promotion),
      );

      return finalizeOrder(orderId, {
        ...totals,
        customerId: form.customerId,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        ...buildOrderPromotionSelection(promotion),
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
