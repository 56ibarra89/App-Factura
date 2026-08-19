import { useState, useEffect, useCallback } from "react";
import {
  customerRepository,
  type ICustomerRepository,
} from "../api/customerRepository";
import type {
  Customer,
  CustomerAddress,
  CustomerFormData,
} from "../model/customer.types";

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

interface UseCustomersOptions {
  repository?: ICustomerRepository;
}

export const useCustomers = (options: UseCustomersOptions = {}) => {
  const repository = options.repository ?? customerRepository;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repository.getAll();
      setCustomers(data);
    } catch (err) {
      console.error("useCustomers: error al cargar", err);
      setError("No se pudo cargar la lista de clientes.");
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const createCustomer = useCallback(
    async (data: CustomerFormData): Promise<void> => {
      const name = data.name.trim();
      const phone = data.phone.trim() || undefined;

      if (data.addresses.length === 0) {
        await repository.upsertCustomer(name, undefined, phone);
      } else {
        for (const addr of data.addresses) {
          await repository.upsertCustomer(name, addr.address, phone);
        }
      }

      await loadCustomers();
    },
    [repository, loadCustomers],
  );

  const updateCustomer = useCallback(
    async (data: CustomerFormData): Promise<void> => {
      if (!data.id) throw new Error("ID requerido para editar");
      const existing = customers.find((c) => c.id === data.id);
      if (!existing) throw new Error("Cliente no encontrado");

      const updated: Customer = {
        ...existing,
        name: data.name.trim(),
        nameLower: data.name.toLowerCase().trim(),
        phone: data.phone.trim() || undefined,
        addresses: data.addresses,
        updatedAt: new Date().toISOString(),
      };

      await repository.update(updated);

      const name = data.name.trim();
      const phone = data.phone.trim() || undefined;
      for (const addr of data.addresses) {
        await repository.upsertCustomer(name, addr.address, phone);
      }

      await loadCustomers();
    },
    [customers, repository, loadCustomers],
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<void> => {
      await repository.delete(id);
      await loadCustomers();
    },
    [repository, loadCustomers],
  );

  const addAddress = (
    addresses: CustomerAddress[],
    text: string,
  ): CustomerAddress[] => {
    const trimmed = text.trim();
    if (!trimmed) return addresses;
    const already = addresses.some(
      (a) => a.address.toLowerCase() === trimmed.toLowerCase(),
    );
    if (already) return addresses;
    const now = new Date().toISOString();
    return [
      ...addresses,
      { id: generateId(), address: trimmed, lastUsed: now },
    ];
  };

  const removeAddress = (
    addresses: CustomerAddress[],
    id: string,
  ): CustomerAddress[] => addresses.filter((a) => a.id !== id);

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addAddress,
    removeAddress,
    reload: loadCustomers,
  };
};

