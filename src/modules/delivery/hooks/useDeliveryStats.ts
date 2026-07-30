import { useCallback } from "react";
import {
  deliveryGateway,
  type DeliveryGateway,
} from "../api/deliveryGateway";

export function useDeliveryStats(
  gateway: Pick<DeliveryGateway, "getStats"> = deliveryGateway,
) {
  const fetchDeliveryStats = useCallback(
    async (date: Date = new Date()) => {
      try {
        return await gateway.getStats(date);
      } catch (cause: unknown) {
        console.error(
          "Error fetching delivery stats",
          cause,
        );
        return [];
      }
    },
    [gateway],
  );

  return { fetchDeliveryStats };
}
