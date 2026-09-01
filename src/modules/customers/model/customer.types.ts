export interface CustomerAddress {
  id: string;
  address: string;
  isDefault?: boolean;
  lastUsed: string;
}

export interface CustomerPhone {
  id: string;
  phone: string;
  isDefault?: boolean;
  lastUsed: string;
}

export interface Customer {
  id: string;
  nameLower: string;
  name: string;
  phone?: string;
  phones?: CustomerPhone[];
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  id?: string;
  name: string;
  phone?: string;
  phones: CustomerPhone[];
  addresses: CustomerAddress[];
}
