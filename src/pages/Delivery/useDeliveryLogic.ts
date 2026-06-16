import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerSearch } from "../../hooks/useCustomerSearch";
import { useCustomers } from "../../hooks/useCustomers";
import { Customer } from "../../types/customer.types";
import { UserAccount } from "../../types/user";
import { apiClient } from "../../config/apiClient";

export function useDeliveryLogic() {
  const navigate = useNavigate();
  const { suggestions, search, clearSuggestions } = useCustomerSearch();
  const { addAddress, removeAddress, updateCustomer } = useCustomers();

  const [phoneInput, setPhoneInput] = useState("");
  const [transporteInput, setTransporteInput] = useState("0.00");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [drivers, setDrivers] = useState<UserAccount[]>([]);
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
        const users = await apiClient("/users");
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const todayNameStr = days[new Date().getDay()];

        const motorizados = users.filter((u: UserAccount) => {
          if (u.role !== "motorizado") return false;
          
          const isScheduled = u.workDays && u.workDays.includes(todayNameStr);
          const hasExtraDay = u.extraDays && u.extraDays.some(d => d.date.startsWith(todayStr));
          
          return isScheduled || hasExtraDay;
        });
        
        setDrivers(motorizados);

        // Fetch stats
        const statsData = await apiClient(`/users/motorizados/delivery-stats?date=${todayStr}`);
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching motorizados or stats:", err);
      }
    };
    fetchDriversAndStats();
  }, []);

  const handleConfirm = useCallback(() => {
    navigate("/facturacion", {
      state: { 
        deliveryCustomer: selectedCustomer, 
        deliveryPhone: selectedCustomer?.phone || phoneInput,
        deliveryCost: parseFloat(transporteInput) || 0,
        deliveryDriverId: selectedDriverId || undefined,
      },
    });
  }, [navigate, selectedCustomer, phoneInput, transporteInput, selectedDriverId]);

  const handleKeypadPress = useCallback((val: string) => {
    if (val === "BACK") {
       setPhoneInput((prev) => prev.slice(0, -1));
    } else if (val === "CLEAR" || val === "C") {
       setPhoneInput("");
    } else if (val === "CHECK" || val === "CHECK2") {
       handleConfirm();
    } else if (val !== ".") {
       setPhoneInput((prev) => prev + val);
    }
  }, [handleConfirm]);

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
    phoneInput, setPhoneInput,
    transporteInput, setTransporteInput,
    selectedCustomer, setSelectedCustomer,
    selectedAddress, setSelectedAddress,
    searchDialogOpen, setSearchDialogOpen,
    customerFormOpen, setCustomerFormOpen,
    drivers,
    stats,
    selectedDriverId,
    setSelectedDriverId,
    handleKeypadPress, handleConfirm,
    addAddress, removeAddress, updateCustomer
  };
}
