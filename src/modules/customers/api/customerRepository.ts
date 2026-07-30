import type { Customer } from "../model/customer.types";
import { apiClient } from "../../../shared/api";

export interface ICustomerRepository {
  searchByName(query: string): Promise<Customer[]>;
  upsertCustomer(
    name: string,
    address?: string,
    phone?: string,
  ): Promise<{ customer: Customer; isNew: boolean }>;
  getAll(): Promise<Customer[]>;
  update(customer: Customer): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Customer | null>;
}

class CustomerRepository implements ICustomerRepository {
  /**
   * Búsqueda por subcadena de nombre o teléfono.
   */
  async searchByName(query: string): Promise<Customer[]> {
    return await apiClient(`/customers?query=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  }

  /**
   * Upsert de cliente:
   */
  async upsertCustomer(
    name: string,
    address?: string,
    phone?: string
  ): Promise<{ customer: Customer; isNew: boolean }> {
    return await apiClient("/customers/upsert", {
      method: "POST",
      body: JSON.stringify({ name, address, phone }),
    });
  }

  /** Devuelve todos los clientes. */
  async getAll(): Promise<Customer[]> {
    return await apiClient("/customers", {
      method: "GET",
    });
  }

  /** Actualiza un cliente existente. */
  async update(customer: Customer): Promise<void> {
    const { id, name, phone } = customer;
    await apiClient(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name, phone }),
    });
  }

  /** Elimina un cliente por su id. */
  async delete(id: string): Promise<void> {
    await apiClient(`/customers/${id}`, {
      method: "DELETE",
    });
  }

  /** Busca un cliente por su ID único. */
  async findById(id: string): Promise<Customer | null> {
    try {
      return await apiClient(`/customers/${id}`, {
        method: "GET",
      });
    } catch (error) {
      console.error("Error buscando cliente por ID:", error);
      return null;
    }
  }
}

export const customerRepository = new CustomerRepository();
