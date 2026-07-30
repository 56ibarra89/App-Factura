/**
 * useCustomerSearch — SRP: encapsula la lógica de búsqueda y guardado de clientes.
 */

import { useState, useCallback, useRef } from "react";
import {
  customerRepository,
  type ICustomerRepository,
} from "../api/customerRepository";
import type { Customer } from "../model/customer.types";

interface UseCustomerSearchOptions {
  repository?: ICustomerRepository;
}

export function useCustomerSearch(options: UseCustomerSearchOptions = {}) {
  const repository = options.repository ?? customerRepository;
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Busca clientes cuyo nombre empiece con `query` (debounce 200ms). */
  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await repository.searchByName(query.trim());
        setSuggestions(results);
      } catch (err) {
        console.error("[CustomerSearch] Error buscando clientes:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  }, [repository]);

  /**
   * Guarda o actualiza un cliente con su dirección.
   * @returns `true` si el cliente es nuevo (para mostrar toast).
   */
  const saveCustomer = useCallback(
    async (name: string, address?: string, phone?: string): Promise<boolean> => {
      if (!name.trim()) return false;
      try {
        const { isNew } = await repository.upsertCustomer(
          name.trim(),
          address?.trim(),
          phone?.trim()
        );
        return isNew;
      } catch (err) {
        console.error("[CustomerSearch] Error guardando cliente:", err);
        return false;
      }
    },
    [repository]
  );

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, search, saveCustomer, clearSuggestions };
}
