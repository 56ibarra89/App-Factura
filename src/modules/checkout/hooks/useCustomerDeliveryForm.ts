import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCustomerSearch,
  customerRepository,
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
  initialAddress?: string;
  initialOrderType: OrderType;
  initialDriverId: string;
  initialDeliveryCost: number;
  gateway: CheckoutGateway;
}

function getPreferredOrRecentPhone(customer: Customer | null): string {
  if (!customer) return "";
  if (customer.phones?.length) {
    const defaultPhone = customer.phones.find((p) => p.isDefault);
    if (defaultPhone) return defaultPhone.phone;
    return [...customer.phones].sort(
      (a, b) =>
        new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
    )[0].phone;
  }
  return customer.phone ?? "";
}

function getPreferredOrRecentAddress(customer: Customer | null): string {
  if (!customer?.addresses?.length) return "";

  const defaultAddr = customer.addresses.find((a) => a.isDefault);
  if (defaultAddr) return defaultAddr.address;

  return [...customer.addresses].sort(
    (a, b) =>
      new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
  )[0].address;
}

export function useCustomerDeliveryForm({
  open,
  initialCustomer,
  initialPhone,
  initialAddress,
  initialOrderType,
  initialDriverId,
  initialDeliveryCost,
  gateway,
}: UseCustomerDeliveryFormOptions) {
  const [customerName, setCustomerName] = useState(
    initialCustomer?.name ?? "",
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialPhone || getPreferredOrRecentPhone(initialCustomer),
  );
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [customerAddress, setCustomerAddress] = useState(
    initialAddress || getPreferredOrRecentAddress(initialCustomer),
  );
  const [selectedDriverId, setSelectedDriverId] =
    useState<string>(initialDriverId);
  const [deliveryCost, setDeliveryCost] = useState<number>(
    initialDeliveryCost,
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialCustomer,
  );

  const [drivers, setDrivers] = useState<UserAccount[]>([]);
  const [deliveryPrices, setDeliveryPrices] = useState<string[]>([]);
  const [driverStats, setDriverStats] = useState<DeliveryDriverStats[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

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
    setLoadingDrivers(true);
    void gateway
      .getDeliveryDrivers(new Date())
      .then(({ drivers: availableDrivers, stats }) => {
        if (!active) return;
        setDrivers(availableDrivers);
        setDriverStats(stats);
      })
      .catch((error: unknown) => {
        console.error("Error fetching delivery drivers:", error);
      })
      .finally(() => {
        if (active) setLoadingDrivers(false);
      });

    return () => {
      active = false;
    };
  }, [gateway, orderType]);

  useEffect(() => {
    if (!open) return;
    setCustomerName(initialCustomer?.name ?? "");
    setSelectedCustomer(initialCustomer);
    setCustomerPhone(
      initialPhone || getPreferredOrRecentPhone(initialCustomer),
    );
    setOrderType(initialOrderType);
    setCustomerAddress(
      initialAddress || getPreferredOrRecentAddress(initialCustomer),
    );
    setDeliveryCost(initialDeliveryCost);
    setSelectedDriverId(initialDriverId);
  }, [
    initialAddress,
    initialCustomer,
    initialDeliveryCost,
    initialDriverId,
    initialOrderType,
    initialPhone,
    open,
  ]);

  const handleCustomerSelect = useCallback(
    (customer: Customer | null) => {
      setSelectedCustomer(customer);
      if (!customer) {
        return;
      }

      setCustomerPhone((currentPhone) => {
        const trimmedCurrent = currentPhone.trim();
        if (!trimmedCurrent) {
          return getPreferredOrRecentPhone(customer);
        }
        const knownPhones = [
          customer.phone,
          ...(customer.phones?.map((p) => p.phone) ?? []),
        ]
          .filter(Boolean)
          .map((p) => p!.trim());

        if (knownPhones.includes(trimmedCurrent)) {
          return trimmedCurrent;
        }

        return trimmedCurrent;
      });

      if (orderType === "delivery") {
        setCustomerAddress(getPreferredOrRecentAddress(customer));
      }
    },
    [orderType],
  );

  const savedPhones = useMemo(() => {
    if (!selectedCustomer) return [];
    const phonesList: string[] = [];
    if (selectedCustomer.phones?.length) {
      const sorted = [...selectedCustomer.phones].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (
          new Date(b.lastUsed).getTime() -
          new Date(a.lastUsed).getTime()
        );
      });
      sorted.forEach((p) => {
        const clean = p.phone?.trim();
        if (clean && !phonesList.includes(clean)) {
          phonesList.push(clean);
        }
      });
    }
    if (selectedCustomer.phone) {
      const clean = selectedCustomer.phone.trim();
      if (clean && !phonesList.includes(clean)) {
        phonesList.push(clean);
      }
    }
    return phonesList;
  }, [selectedCustomer]);

  const savedAddresses = useMemo(
    () =>
      selectedCustomer?.addresses
        ? [...selectedCustomer.addresses]
            .sort((a, b) => {
              if (a.isDefault && !b.isDefault) return -1;
              if (!a.isDefault && b.isDefault) return 1;
              return (
                new Date(b.lastUsed).getTime() -
                new Date(a.lastUsed).getTime()
              );
            })
            .map((address) => address.address)
        : [],
    [selectedCustomer],
  );

  const persistCustomer = useCallback(async () => {
    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();
    if (!trimmedName && !trimmedPhone) return false;

    const nameToSave = trimmedName || `Cliente ${trimmedPhone}`;

    if (selectedCustomer?.id) {
      try {
        await customerRepository.update({
          id: selectedCustomer.id,
          name: nameToSave,
          phone: trimmedPhone || undefined,
          address: orderType === "delivery" ? customerAddress?.trim() : undefined,
        });
        return false;
      } catch (err) {
        console.error("Error actualizando cliente en persistCustomer:", err);
      }
    }

    return saveCustomer(
      nameToSave,
      orderType === "delivery" ? customerAddress : undefined,
      trimmedPhone || undefined,
    );
  }, [
    customerAddress,
    customerName,
    customerPhone,
    orderType,
    saveCustomer,
    selectedCustomer,
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
    selectedCustomer,
    savedPhones,
    savedAddresses,
    drivers,
    driverStats,
    selectedDriverId,
    setSelectedDriverId,
    deliveryCost,
    setDeliveryCost,
    deliveryPrices,
    loadingDrivers,
    persistCustomer,
  };
}
