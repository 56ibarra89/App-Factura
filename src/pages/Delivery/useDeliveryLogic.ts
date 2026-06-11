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
  const [focusedField, setFocusedField] = useState<"phone" | "transporte">("phone");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [drivers, setDrivers] = useState<UserAccount[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

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
    const fetchDrivers = async () => {
      try {
        const users = await apiClient("/users");
        const motorizados = users.filter((u: UserAccount) => u.role === "motorizado");
        setDrivers(motorizados);
      } catch (err) {
        console.error("Error fetching motorizados:", err);
      }
    };
    fetchDrivers();
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
      if (focusedField === "phone") {
         setPhoneInput((prev) => prev.slice(0, -1));
      } else {
         setTransporteInput((prev) => prev.slice(0, -1));
      }
    } else if (val === "CLEAR") {
      if (focusedField === "phone") {
         setPhoneInput("");
      } else {
         setTransporteInput("0.00");
      }
    } else if (val === "CHECK" || val === "CHECK2") {
      if (focusedField === "phone") {
        setFocusedField("transporte");
      } else {
        handleConfirm();
      }
    } else if (val === ".") {
      if (focusedField === "transporte" && !transporteInput.includes(".")) {
         setTransporteInput((prev) => prev + ".");
      }
    } else {
      if (focusedField === "phone") {
         setPhoneInput((prev) => prev + val);
      } else {
         if (transporteInput === "0.00") {
             setTransporteInput(val);
         } else {
             setTransporteInput((prev) => prev + val);
         }
      }
    }
  }, [focusedField, phoneInput, transporteInput, handleConfirm]);

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
      } else if (e.key === ".") {
        handleKeypadPress(".");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeypadPress, handleConfirm, selectedCustomer]);

  return {
    phoneInput, setPhoneInput,
    transporteInput, setTransporteInput,
    focusedField, setFocusedField,
    selectedCustomer, setSelectedCustomer,
    selectedAddress, setSelectedAddress,
    searchDialogOpen, setSearchDialogOpen,
    customerFormOpen, setCustomerFormOpen,
    drivers,
    selectedDriverId,
    setSelectedDriverId,
    handleKeypadPress, handleConfirm,
    addAddress, removeAddress, updateCustomer
  };
}
