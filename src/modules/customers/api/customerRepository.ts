import type {
  Customer,
  CustomerAddress,
  CustomerPhone,
} from "../model/customer.types";
import { apiClient } from "../../../shared/api";

export interface UpdateCustomerPayload {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
  phones?: CustomerPhone[];
  addresses?: CustomerAddress[];
}

export interface ICustomerRepository {
  searchByName(query: string): Promise<Customer[]>;
  createCustomer(
    name: string,
    address?: string,
    phone?: string,
  ): Promise<Customer>;
  upsertCustomer(
    name: string,
    address?: string,
    phone?: string,
  ): Promise<{ customer: Customer; isNew: boolean }>;
  getAll(): Promise<Customer[]>;
  update(customer: UpdateCustomerPayload): Promise<Customer>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Customer | null>;
}

class CustomerRepository implements ICustomerRepository {
  async searchByName(query: string): Promise<Customer[]> {
    return await apiClient(`/customers?query=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  }

  /**
   * Creación explícita de un nuevo cliente independiente (POST /customers)
   */
  async createCustomer(
    name: string,
    address?: string,
    phone?: string,
  ): Promise<Customer> {
    return await apiClient("/customers", {
      method: "POST",
      body: JSON.stringify({ name, address, phone }),
    });
  }

  /**
   * Upsert de cliente (legado/fallback)
   */
  async upsertCustomer(
    name: string,
    address?: string,
    phone?: string,
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

  /** Actualiza un cliente existente por su ID (PATCH /customers/:id). */
  async update(customer: UpdateCustomerPayload): Promise<Customer> {
    const { id, name, phone, address, phones, addresses } = customer;
    return await apiClient(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name, phone, address, phones, addresses }),
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
