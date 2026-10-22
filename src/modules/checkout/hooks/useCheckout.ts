import { useCallback } from "react";
import {
  useOrderCommands,
  useOrderQueries,
  type Order,
  type OrderItem,
} from "../../orders";
import {
  buildSupplementalCartItems,
  buildOrderPromotionSelection,
  extractCertificateSerials,
} from "../model/checkoutDomain";
import type { CheckoutFormValues } from "../model/checkout.types";
import { calculateCartTotals } from "../model/cartTotals";
import type { AppliedPromotion } from "../../promotions";
import { useTaxConfig } from "../../settings";

export function useCheckout(
  cart: OrderItem[],
  promotion: AppliedPromotion | null,
  promotionChanged = false,
) {
  const { taxes, isExonerated } = useTaxConfig();
  const { addOrder, updateOrderItems, finalizeOrder, markAsSentToKitchen } =
    useOrderCommands();
  const { orders } = useOrderQueries();

  const shouldPreservePromotion = useCallback(
    (orderId: string) => {
      if (promotionChanged) return false;
      const existingOrder: Order | undefined = orders.find(
        (order) => order.id === orderId,
      );
      return Boolean(
        existingOrder &&
          (existingOrder.couponId ||
            existingOrder.discountId ||
            existingOrder.happyHourId ||
            existingOrder.promotionSource === "coupon" ||
            existingOrder.promotionSource === "discount" ||
            existingOrder.promotionSource === "happy-hour" ||
            existingOrder.items.some(
              (item) => item.giftReason === "happy-hour-2x1",
            )),
      );
    },
    [orders, promotionChanged],
  );

  const buildCheckoutCart = useCallback(
    (form: CheckoutFormValues) => [
      ...cart,
      ...buildSupplementalCartItems(
        form.packagingItems,
        form.orderType === "delivery" ? form.deliveryCost : undefined,
        form.orderType === "delivery" ? form.deliveryZoneName : undefined,
        form.orderType === "delivery" ? form.deliveryDriverPayout : undefined,
        form.orderType === "delivery" ? form.isFreeDelivery : false,
      ),
    ],
    [cart],
  );

  const confirmFactura = useCallback(
    async (form: CheckoutFormValues) => {
      const items = buildCheckoutCart(form);
      const totals = calculateCartTotals(items, taxes, isExonerated, promotion);

      return addOrder({
        items,
        ...totals,
        isSentToKitchen: false,
        customerId: form.customerId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        payments: form.payments,
        ...buildOrderPromotionSelection(promotion),
        certificateSerials: extractCertificateSerials(items),
        driverId: form.driverId,
        customerTendered: form.customerTendered,
      });
    },
    [addOrder, buildCheckoutCart, isExonerated, promotion, taxes],
  );

  const saveTableOrder = useCallback(
    async (orderId?: string, tableId?: string) => {
      const totals = calculateCartTotals(cart, taxes, isExonerated, promotion);
      const promotionSelection =
        orderId && shouldPreservePromotion(orderId)
          ? {}
          : buildOrderPromotionSelection(promotion);

      if (orderId) {
        await updateOrderItems(
          orderId,
          cart,
          totals.total,
          totals.subTotal,
          totals.taxAmount,
          totals.discountAmount,
          promotionSelection,
        );
        return orderId;
      }

      return addOrder({
        items: cart,
        ...totals,
        orderType: "local",
        tableId,
        ...promotionSelection,
        certificateSerials: extractCertificateSerials(cart),
      });
    },
    [
      addOrder,
      cart,
      isExonerated,
      promotion,
      shouldPreservePromotion,
      taxes,
      updateOrderItems,
    ],
  );

  const finalizeTableOrder = useCallback(
    async (orderId: string, form: CheckoutFormValues) => {
      const items = buildCheckoutCart(form);
      const totals = calculateCartTotals(items, taxes, isExonerated, promotion);
      const promotionSelection =
        shouldPreservePromotion(orderId)
          ? {}
          : buildOrderPromotionSelection(promotion);

      await updateOrderItems(
        orderId,
        items,
        totals.total,
        totals.subTotal,
        totals.taxAmount,
        totals.discountAmount,
        promotionSelection,
      );

      return finalizeOrder(orderId, {
        ...totals,
        customerId: form.customerId,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        payments: form.payments,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        ...promotionSelection,
        certificateSerials: extractCertificateSerials(items),
      });
    },
    [
      buildCheckoutCart,
      finalizeOrder,
      isExonerated,
      promotion,
      shouldPreservePromotion,
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
