import { useEffect, useMemo, useState } from "react";
import type { PackagingItem } from "../model/checkout.types";
import type { OrderType } from "../../orders";
import type { PackagingSizeConfig } from "../../catalog";
import type { CheckoutGateway } from "../api/checkoutGateway";

interface UsePackagingSelectionOptions {
  open: boolean;
  orderType: OrderType;
  gateway: CheckoutGateway;
}

export function usePackagingSelection({
  open,
  orderType,
  gateway,
}: UsePackagingSelectionOptions) {
  const [packagingConfig, setPackagingConfig] = useState<
    PackagingSizeConfig[]
  >([]);
  const [packagingQuantities, setPackagingQuantities] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    let active = true;
    void gateway
      .getPackagingSizes()
      .then((packaging) => {
        if (active) setPackagingConfig(packaging);
      })
      .catch((error: unknown) => {
        console.error("Error loading packaging configuration:", error);
      });

    return () => {
      active = false;
    };
  }, [gateway]);

  useEffect(() => {
    if (open) setPackagingQuantities({});
  }, [open]);

  const packagingItems = useMemo<PackagingItem[]>(
    () =>
      orderType === "llevar" || orderType === "delivery"
        ? packagingConfig
            .filter(
              (packaging) =>
                (packagingQuantities[packaging.name] ?? 0) > 0,
            )
            .map((packaging) => ({
              name: packaging.name,
              price: packaging.price,
              quantity: packagingQuantities[packaging.name] ?? 0,
            }))
        : [],
    [orderType, packagingConfig, packagingQuantities],
  );

  const totalPackagingCost = useMemo(
    () =>
      packagingItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [packagingItems],
  );

  return {
    packagingConfig,
    packagingQuantities,
    setPackagingQuantities,
    packagingItems,
    totalPackagingCost,
  };
}
