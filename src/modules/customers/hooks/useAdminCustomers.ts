import { useMemo, useState, useEffect } from "react";
import type {
  Customer,
  CustomerFormData,
} from "../model/customer.types";
import { useCustomers } from "./useCustomers";

interface CustomerNotification {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

export function useAdminCustomers() {
  const [search, updateSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, updateRowsPerPage] = useState(10);
  const setSearch = (value: string) => { setPage(0); updateSearch(value); };
  const setRowsPerPage = (value: number) => { setPage(0); updateRowsPerPage(value); };
  const customerData = useCustomers({ page, limit: rowsPerPage, query: search });
  useEffect(() => {
    if (!customerData.loading && page > 0 && page * rowsPerPage >= customerData.total) {
      setPage(Math.max(0, Math.ceil(customerData.total / rowsPerPage) - 1));
    }
  }, [customerData.loading, customerData.total, page, rowsPerPage]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<CustomerNotification>({
    open: false,
    message: "",
    severity: "success",
  });

  const filteredCustomers = useMemo(() => {
    return customerData.customers;
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
    page, setPage, rowsPerPage, setRowsPerPage,
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
