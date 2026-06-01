/**
 * useCustomers — SRP: encapsula todo el estado y las operaciones CRUD de clientes.
 * DIP: depende del customerRepository (abstracción).
 */

import { useState, useEffect, useCallback } from "react";
import { customerRepository } from "../repositories/CustomerRepository";
import { Customer, CustomerAddress } from "../types/customer.types";
import type { ICustomerRepository } from "../types/repositories";

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export interface CustomerFormData {
  /** ID único del cliente que se está editando; vacío = creación nueva */
  id?: string;
  name: string;
  phone: string;
  /** Lista de direcciones editables */
  addresses: CustomerAddress[];
}

interface UseCustomersOptions {
  repository?: ICustomerRepository;
}

export const useCustomers = (options: UseCustomersOptions = {}) => {
  const repository = options.repository ?? customerRepository;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Carga inicial ────────────────────────────────────────────────────────────
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

  // ── Crear ────────────────────────────────────────────────────────────────────
  const createCustomer = useCallback(
    async (data: CustomerFormData): Promise<void> => {
      const name = data.name.trim();
      const phone = data.phone.trim() || undefined;
      
      if (data.addresses.length === 0) {
        // Crear cliente sin direcciones
        await repository.upsertCustomer(name, undefined, phone);
      } else {
        // Crear cliente y agregar cada dirección. upsertCustomer en el backend
        // agrega la dirección si el cliente ya existe (por nombre).
        for (const addr of data.addresses) {
          await repository.upsertCustomer(name, addr.address, phone);
        }
      }
      
      await loadCustomers();
    },
    [repository, loadCustomers]
  );

  // ── Actualizar ───────────────────────────────────────────────────────────────
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
      
      // Actualizamos nombre y teléfono
      await repository.update(updated);
      
      // Sincronizamos las direcciones agregadas (el backend no soporta eliminar direcciones por ahora,
      // pero esto asegura que las nuevas se agreguen).
      const name = data.name.trim();
      const phone = data.phone.trim() || undefined;
      for (const addr of data.addresses) {
        await repository.upsertCustomer(name, addr.address, phone);
      }
      
      await loadCustomers();
    },
    [customers, repository, loadCustomers]
  );

  // ── Eliminar ─────────────────────────────────────────────────────────────────
  const deleteCustomer = useCallback(
    async (id: string): Promise<void> => {
      await repository.delete(id);
      await loadCustomers();
    },
    [repository, loadCustomers]
  );

  // ── Helpers de dirección ─────────────────────────────────────────────────────
  const addAddress = (
    addresses: CustomerAddress[],
    text: string
  ): CustomerAddress[] => {
    const trimmed = text.trim();
    if (!trimmed) return addresses;
    const already = addresses.some(
      (a) => a.address.toLowerCase() === trimmed.toLowerCase()
    );
    if (already) return addresses;
    const now = new Date().toISOString();
    return [...addresses, { id: generateId(), address: trimmed, lastUsed: now }];
  };

  const removeAddress = (
    addresses: CustomerAddress[],
    id: string
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
