export interface CustomerAddress {
  id: string;
  address: string;
  lastUsed: string;
}

export interface Customer {
  id: string;
  nameLower: string;
  name: string;
  phone?: string;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  id?: string;
  name: string;
  phone: string;
  addresses: CustomerAddress[];
}
