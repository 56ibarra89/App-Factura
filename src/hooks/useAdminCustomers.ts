import { useMemo, useState } from "react";
import type { Customer } from "../types/customer.types";
import {
  useCustomers,
  type CustomerFormData,
} from "./useCustomers";

interface CustomerNotification {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export function useAdminCustomers() {
  const customerData = useCustomers();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<CustomerNotification>({
    open: false,
    message: "",
    severity: "success",
  });

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return customerData.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.phone?.includes(search),
    );
  }, [customerData.customers, search]);

  const notify = (
    message: string,
    severity: CustomerNotification["severity"],
  ) => setNotification({ open: true, message, severity });

  const openCreate = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  const save = async (data: CustomerFormData) => {
    try {
      if (data.id) {
        await customerData.updateCustomer(data);
        notify("Cliente actualizado correctamente.", "success");
      } else {
        await customerData.createCustomer(data);
        notify("Cliente creado correctamente.", "success");
      }
    } catch (error) {
      notify("Error al guardar el cliente.", "error");
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await customerData.deleteCustomer(pendingDelete);
      notify("Cliente eliminado.", "success");
    } catch {
      notify("Error al eliminar el cliente.", "error");
    } finally {
      setPendingDelete(null);
    }
  };

  return {
    ...customerData,
    search,
    filteredCustomers,
    modalOpen,
    editingCustomer,
    pendingDelete,
    notification,
    setSearch,
    openCreate,
    openEdit,
    closeModal,
    save,
    requestDelete: setPendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    closeNotification: () =>
      setNotification((current) => ({ ...current, open: false })),
  };
}
