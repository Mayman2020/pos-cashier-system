export interface Customer {
  id: number;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyaltyPoints?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerRequest {
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyaltyPoints?: number;
  active?: boolean;
}
