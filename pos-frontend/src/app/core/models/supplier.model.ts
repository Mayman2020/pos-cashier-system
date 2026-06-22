export interface Supplier {
  id: number;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRequest {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  active?: boolean;
}
