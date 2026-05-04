/**
 * CustomerRepository — SRP: toda la persistencia de clientes vive aquí.
 * Usa nameLower como keyPath para búsquedas de prefijo eficientes con IDBKeyRange.
 */

import { initDB, STORES } from "./db.config";
import { Customer, CustomerAddress } from "../types/customer.types";

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export class CustomerRepository {
  /**
   * Búsqueda por prefijo de nombre (case-insensitive).
   * Ej: "juan" devuelve "Juan Pérez", "Juan Dávila", etc.
   */
  async searchByName(query: string): Promise<Customer[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readonly");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const lowerQuery = query.toLowerCase().trim();
      const range = IDBKeyRange.bound(lowerQuery, lowerQuery + "\uffff");
      const request = store.getAll(range);
      request.onsuccess = () => {
        // Ordenar por nombre ascendente
        const sorted = (request.result as Customer[]).sort((a, b) =>
          a.name.localeCompare(b.name, "es")
        );
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Upsert de cliente:
   * - Si ya existe (mismo nombre normalizado): agrega la dirección si es nueva,
   *   o actualiza su `lastUsed` si ya existía.
   * - Si no existe: crea el registro.
   * @returns { customer, isNew } — isNew=true la primera vez que se guarda.
   */
  async upsertCustomer(
    name: string,
    address?: string,
    phone?: string
  ): Promise<{ customer: Customer; isNew: boolean }> {
    const nameLower = name.toLowerCase().trim();
    const cleanName = name.trim();
    const now = new Date().toISOString();

    const existing = await this.findByKey(nameLower);
    const isNew = !existing;

    let customer: Customer;

    if (existing) {
      customer = { ...existing, updatedAt: now };

      // Actualiza el teléfono si se proporciona uno nuevo
      if (phone?.trim()) customer.phone = phone.trim();

      if (address?.trim()) {
        const addrLower = address.trim().toLowerCase();
        const addrExists = customer.addresses.find(
          (a) => a.address.toLowerCase() === addrLower
        );

        if (addrExists) {
          // Solo actualiza lastUsed para que aparezca primero la próxima vez
          customer.addresses = customer.addresses.map((a) =>
            a.address.toLowerCase() === addrLower ? { ...a, lastUsed: now } : a
          );
        } else {
          // Agrega la nueva dirección al historial del cliente
          const newAddr: CustomerAddress = {
            id: generateId(),
            address: address.trim(),
            lastUsed: now,
          };
          customer.addresses = [...customer.addresses, newAddr];
        }
      }
    } else {
      customer = {
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

  /** Busca un cliente por su clave primaria exacta */
  private async findByKey(nameLower: string): Promise<Customer | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUSTOMERS, "readonly");
      const store = tx.objectStore(STORES.CUSTOMERS);
      const request = store.get(nameLower);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }
}

export const customerRepository = new CustomerRepository();
