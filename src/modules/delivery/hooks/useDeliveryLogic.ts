import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCustomerSearch,
  useCustomers,
  type Customer,
} from "../../customers";
import type { DeliveryDriver } from "../model/delivery.types";
import {
  deliveryGateway,
  type DeliveryGateway,
} from "../api/deliveryGateway";

export function useDeliveryLogic(gateway: DeliveryGateway = deliveryGateway) {
  const navigate = useNavigate();
  const { suggestions, search, clearSuggestions } = useCustomerSearch();
  const { addAddress, removeAddress, updateCustomer } = useCustomers();

  const [phoneInput, setPhoneInput] = useState("");
  const [transporteInput, setTransporteInput] = useState("0.00");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [stats, setStats] = useState<{ userId: string; todayDeliveries: number }[]>([]);

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);

  useEffect(() => {
    if (phoneInput.length >= 8) {
      search(phoneInput);
    } else {
      clearSuggestions();
      setSelectedCustomer(null);
    }
  }, [phoneInput, search, clearSuggestions]);

  useEffect(() => {
    if (suggestions.length > 0) {
      setSelectedCustomer(suggestions[0]);
      if (suggestions[0].addresses && suggestions[0].addresses.length > 0) {
        setSelectedAddress(suggestions[0].addresses[0].address);
      }
    } else {
      setSelectedCustomer(null);
      setSelectedAddress("");
    }
  }, [suggestions]);

  useEffect(() => {
    const fetchDriversAndStats = async () => {
      try {
        const now = new Date();
        const [motorizados, statsData] = await Promise.all([
          gateway.listAvailableDrivers(now),
          gateway.getStats(now),
        ]);
        setDrivers(motorizados);
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching motorizados or stats:", err);
      }
    };
    void fetchDriversAndStats();
  }, [gateway]);

  const handleConfirm = useCallback(() => {
    navigate("/facturacion", {
      state: {
        fromDeliveryPage: true,
        deliveryCustomer: selectedCustomer,
        deliveryPhone: selectedCustomer?.phone || phoneInput || undefined,
        deliveryAddress: selectedAddress || undefined,
        deliveryCost: parseFloat(transporteInput) || 0,
        deliveryDriverId: selectedDriverId || undefined,
      },
    });
  }, [
    navigate,
    selectedCustomer,
    phoneInput,
    selectedAddress,
    transporteInput,
    selectedDriverId,
  ]);

  const handleKeypadPress = useCallback(
    (val: string) => {
      if (val === "BACK") {
        setPhoneInput((prev) => prev.slice(0, -1));
      } else if (val === "CLEAR" || val === "C") {
        setPhoneInput("");
      } else if (val === "CHECK" || val === "CHECK2") {
        handleConfirm();
      } else if (val !== ".") {
        setPhoneInput((prev) => prev + val);
      }
    },
    [handleConfirm],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key >= "0" && e.key <= "9") {
        handleKeypadPress(e.key);
      } else if (e.key === "Backspace") {
        handleKeypadPress("BACK");
      } else if (e.key === "Enter") {
        if (selectedCustomer) {
          handleConfirm();
        } else {
          handleKeypadPress("CHECK");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeypadPress, handleConfirm, selectedCustomer]);

  return {
    phoneInput,
    setPhoneInput,
    transporteInput,
    setTransporteInput,
    selectedCustomer,
    setSelectedCustomer,
    selectedAddress,
    setSelectedAddress,
    searchDialogOpen,
    setSearchDialogOpen,
    customerFormOpen,
    setCustomerFormOpen,
    drivers,
    stats,
    selectedDriverId,
    setSelectedDriverId,
    handleKeypadPress,
    handleConfirm,
    addAddress,
    removeAddress,
    updateCustomer,
  };
}
