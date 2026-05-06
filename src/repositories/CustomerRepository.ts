/**
 * CustomerRepository — SRP: toda la persistencia de clientes vive aquí.
 * Usa nameLower como keyPath para búsquedas de prefijo eficientes con IDBKeyRange.
 */

import { initDB, STORES } from "./db.config";
import { Customer } from "../types/customer.types";

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

class CustomerRepository {
  /**
   * Búsqueda por prefijo de nombre (case-insensitive).
   * Ej: "juan" devuelve "Juan Pérez", "Juan Dávila", etc.
   */
  /**
   * Búsqueda por subcadena de nombre o teléfono (case-insensitive).
   * Obtiene todos los clientes y filtra en memoria para permitir búsquedas flexibles.
   */
  async searchByName(query: string): Promise<Customer[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readonly");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const lowerQuery = query.toLowerCase().trim();
      const request = store.getAll();

      request.onsuccess = () => {
        const all = request.result as Customer[];
        const filtered = all.filter(
          (c) =>
            c.nameLower.includes(lowerQuery) ||
            (c.phone && c.phone.includes(lowerQuery))
        );

        const sorted = filtered.sort((a, b) =>
          a.name.localeCompare(b.name, "es")
        );
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Upsert de cliente:
   * Busca por nombre (nameLower) para ver si existe.
   */
  async upsertCustomer(
    name: string,
    address?: string,
    phone?: string
  ): Promise<{ customer: Customer; isNew: boolean }> {
    const nameLower = name.toLowerCase().trim();
    const cleanName = name.trim();
    const now = new Date().toISOString();

    const existing = await this.findByNameLower(nameLower);
    const isNew = !existing;

    let customer: Customer;

    if (existing) {
      customer = { ...existing, updatedAt: now };
      if (phone?.trim()) customer.phone = phone.trim();

      if (address?.trim()) {
        const addrLower = address.trim().toLowerCase();
        const addrExists = customer.addresses.find(
          (a) => a.address.toLowerCase() === addrLower
        );

        if (addrExists) {
          customer.addresses = customer.addresses.map((a) =>
            a.address.toLowerCase() === addrLower ? { ...a, lastUsed: now } : a
          );
        } else {
          customer.addresses = [
            ...customer.addresses,
            { id: generateId(), address: address.trim(), lastUsed: now },
          ];
        }
      }
    } else {
      customer = {
        id: crypto.randomUUID(),
        nameLower,
        name: cleanName,
        phone: phone?.trim() || undefined,
        addresses: address?.trim()
          ? [{ id: generateId(), address: address.trim(), lastUsed: now }]
          : [],
        createdAt: now,
        updatedAt: now,
      };
    }

    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readwrite");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const request = store.put(customer);
      request.onsuccess = () => resolve({ customer, isNew });
      request.onerror = () => reject(request.error);
    });
  }

  /** Devuelve todos los clientes ordenados por nombre ascendente. */
  async getAll(): Promise<Customer[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readonly");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const request = store.getAll();
      request.onsuccess = () => {
        const sorted = (request.result as Customer[]).sort((a, b) =>
          a.name.localeCompare(b.name, "es")
        );
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /** Actualiza un cliente existente. */
  async update(customer: Customer): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readwrite");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const request = store.put({
        ...customer,
        updatedAt: new Date().toISOString(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Elimina un cliente por su id. */
  async delete(id: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readwrite");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /** Busca un cliente por su ID único. */
  async findById(id: string): Promise<Customer | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readonly");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  /** Busca un cliente por su nombre normalizado usando el índice. */
  private async findByNameLower(nameLower: string): Promise<Customer | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readonly");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const index = store.index("nameLower");
      const request = index.get(nameLower);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const customerRepository = new CustomerRepository();
