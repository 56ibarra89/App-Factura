import { useState, useEffect, useCallback } from "react";
import {
  customerRepository,
  type ICustomerRepository,
} from "../api/customerRepository";
import type {
  Customer,
  CustomerAddress,
  CustomerPhone,
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
      const defaultPhone = data.phones.find((p) => p.isDefault)?.phone || data.phones[0]?.phone || data.phone?.trim();
      const defaultAddress = data.addresses.find((a) => a.isDefault)?.address || data.addresses[0]?.address?.trim();

      await repository.createCustomer(name, defaultAddress, defaultPhone);
      await loadCustomers();
    },
    [repository, loadCustomers],
  );

  const updateCustomer = useCallback(
    async (data: CustomerFormData): Promise<void> => {
      if (!data.id) throw new Error("ID requerido para editar");
      const existing = customers.find((c) => c.id === data.id);
      if (!existing) throw new Error("Cliente no encontrado");

      await repository.update({
        id: data.id,
        name: data.name.trim(),
        phones: data.phones,
        addresses: data.addresses,
      });

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

  const addPhone = (
    phones: CustomerPhone[],
    text: string,
  ): CustomerPhone[] => {
    const trimmed = text.trim();
    if (!trimmed) return phones;
    const already = phones.some(
      (p) => p.phone === trimmed,
    );
    if (already) return phones;
    const now = new Date().toISOString();
    const isFirst = phones.length === 0;
    return [
      ...phones,
      { id: generateId(), phone: trimmed, isDefault: isFirst, lastUsed: now },
    ];
  };

  const removePhone = (
    phones: CustomerPhone[],
    id: string,
  ): CustomerPhone[] => {
    const next = phones.filter((p) => p.id !== id);
    if (next.length > 0 && !next.some((p) => p.isDefault)) {
      next[0].isDefault = true;
    }
    return next;
  };

  const setDefaultPhone = (
    phones: CustomerPhone[],
    id: string,
  ): CustomerPhone[] =>
    phones.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));

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
    const isFirst = addresses.length === 0;
    return [
      ...addresses,
      { id: generateId(), address: trimmed, isDefault: isFirst, lastUsed: now },
    ];
  };

  const removeAddress = (
    addresses: CustomerAddress[],
    id: string,
  ): CustomerAddress[] => {
    const next = addresses.filter((a) => a.id !== id);
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next[0].isDefault = true;
    }
    return next;
  };

  const setDefaultAddress = (
    addresses: CustomerAddress[],
    id: string,
  ): CustomerAddress[] =>
    addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addPhone,
    removePhone,
    setDefaultPhone,
    addAddress,
    removeAddress,
    setDefaultAddress,
    reload: loadCustomers,
  };
};
