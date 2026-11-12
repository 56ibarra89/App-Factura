
import { useState, useCallback, useRef, useEffect } from "react";
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
  const generation = useRef(0);
  useEffect(() => () => {
    generation.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, [repository]);

  const search = useCallback((query: string) => {
    const request = ++generation.current;
    setSuggestions([]);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await repository.searchByName(query.trim());
        if (request === generation.current) setSuggestions(results);
      } catch (err) {
        console.error("[CustomerSearch] Error buscando clientes:", err);
        if (request === generation.current) setSuggestions([]);
      } finally {
        if (request === generation.current) setLoading(false);
      }
    }, 200);
  }, [repository]);

  const saveCustomer = useCallback(
    async (name: string, address?: string, phone?: string): Promise<{ customer: Customer; isNew: boolean } | null> => {
      if (!name.trim()) return null;
      try {
        const result = await repository.upsertCustomer(
          name.trim(),
          address?.trim(),
          phone?.trim()
        );
        return result;
      } catch (err) {
        console.error("[CustomerSearch] Error guardando cliente:", err);
        throw err;
      }
    },
    [repository]
  );

  const clearSuggestions = useCallback(() => {
    generation.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSuggestions([]);
    setLoading(false);
  }, []);

  return { suggestions, loading, search, saveCustomer, clearSuggestions };
}

