import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCustomerSearch,
  type Customer,
} from "../../customers";
import type { OrderType } from "../../orders";
import type { UserAccount } from "../../accounts";
import type {
  CheckoutGateway,
  DeliveryDriverStats,
} from "../api/checkoutGateway";

interface UseCustomerDeliveryFormOptions {
  open: boolean;
  initialCustomer: Customer | null;
  initialPhone: string;
  initialOrderType: OrderType;
  initialDriverId: string;
  initialDeliveryCost: number;
  gateway: CheckoutGateway;
}

function getMostRecentAddress(customer: Customer | null): string {
  if (!customer?.addresses.length) return "";

  return [...customer.addresses].sort(
    (a, b) =>
      new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
  )[0].address;
}

export function useCustomerDeliveryForm({
  open,
  initialCustomer,
  initialPhone,
  initialOrderType,
  initialDriverId,
  initialDeliveryCost,
  gateway,
}: UseCustomerDeliveryFormOptions) {
  const [customerName, setCustomerName] = useState(
    initialCustomer?.name ?? "",
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialPhone || initialCustomer?.phone || "",
  );
  const [orderType, setOrderType] =
    useState<OrderType>(initialOrderType);
  const [customerAddress, setCustomerAddress] = useState(
    initialOrderType === "delivery"
      ? getMostRecentAddress(initialCustomer)
      : "",
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(initialCustomer);
  const [drivers, setDrivers] = useState<UserAccount[]>([]);
  const [selectedDriverId, setSelectedDriverId] =
    useState(initialDriverId);
  const [deliveryCost, setDeliveryCost] = useState(initialDeliveryCost);
  const [deliveryPrices, setDeliveryPrices] = useState<string[]>([]);
  const [driverStats, setDriverStats] = useState<DeliveryDriverStats[]>(
    [],
  );
  const { saveCustomer } = useCustomerSearch();

  useEffect(() => {
    let active = true;
    void gateway
      .getDeliveryPrices()
      .then((prices) => {
        if (active) setDeliveryPrices(prices);
      })
      .catch((error: unknown) => {
        console.error("Error loading delivery prices:", error);
      });

    return () => {
      active = false;
    };
  }, [gateway]);

  useEffect(() => {
    if (orderType !== "delivery") return;

    let active = true;
    void gateway
      .getDeliveryDrivers(new Date())
      .then(({ drivers: availableDrivers, stats }) => {
        if (!active) return;
        setDrivers(availableDrivers);
        setDriverStats(stats);
      })
      .catch((error: unknown) => {
        console.error("Error fetching delivery drivers:", error);
      });

    return () => {
      active = false;
    };
  }, [gateway, orderType]);

  useEffect(() => {
    if (!open) return;

    setCustomerName(initialCustomer?.name ?? "");
    setCustomerPhone(initialPhone || initialCustomer?.phone || "");
    setOrderType(initialOrderType);
    setSelectedCustomer(initialCustomer);
    setCustomerAddress(
      initialOrderType === "delivery"
        ? getMostRecentAddress(initialCustomer)
        : "",
    );
    setDeliveryCost(initialDeliveryCost);
    setSelectedDriverId(initialDriverId);
  }, [
    initialCustomer,
    initialDeliveryCost,
    initialDriverId,
    initialOrderType,
    initialPhone,
    open,
  ]);

  useEffect(() => {
    if (
      orderType === "delivery" &&
      selectedCustomer &&
      !customerAddress
    ) {
      setCustomerAddress(getMostRecentAddress(selectedCustomer));
    }
  }, [customerAddress, orderType, selectedCustomer]);

  const handleCustomerSelect = useCallback(
    (customer: Customer | null) => {
      setSelectedCustomer(customer);
      if (!customer) {
        setCustomerPhone("");
        setCustomerAddress("");
        return;
      }

      setCustomerPhone(customer.phone ?? "");
      if (orderType === "delivery") {
        setCustomerAddress(getMostRecentAddress(customer));
      }
    },
    [orderType],
  );

  const savedAddresses = useMemo(
    () =>
      selectedCustomer?.addresses
        .slice()
        .sort(
          (a, b) =>
            new Date(b.lastUsed).getTime() -
            new Date(a.lastUsed).getTime(),
        )
        .map((address) => address.address) ?? [],
    [selectedCustomer],
  );

  const persistCustomer = useCallback(async () => {
    if (!customerName.trim()) return false;

    return saveCustomer(
      customerName,
      orderType === "delivery" ? customerAddress : undefined,
      customerPhone || undefined,
    );
  }, [
    customerAddress,
    customerName,
    customerPhone,
    orderType,
    saveCustomer,
  ]);

  return {
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    orderType,
    setOrderType,
    customerAddress,
    setCustomerAddress,
    handleCustomerSelect,
    savedAddresses,
    drivers,
    driverStats,
    selectedDriverId,
    setSelectedDriverId,
    deliveryCost,
    setDeliveryCost,
    deliveryPrices,
    persistCustomer,
  };
}
