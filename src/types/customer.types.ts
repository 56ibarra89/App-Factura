/**
 * Tipos para el módulo de clientes.
 * Un cliente puede tener múltiples direcciones guardadas (casa, trabajo, etc.)
 */

export interface CustomerAddress {
  /** ID único local de la dirección */
  id: string;
  /** Texto completo de la dirección */
  address: string;
  /** Última vez que fue usada (ISO timestamp) — sirve para ordenar por reciente */
  lastUsed: string;
}

export interface Customer {
  /** Clave primaria en IndexedDB: nombre en minúsculas y sin espacios extra */
  nameLower: string;
  name: string;
  phone?: string;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}
