export interface Tax {
  id: number;
  code: string;
  name: string;
  rate: number;
  defaultTax?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxRequest {
  code: string;
  name: string;
  rate: number;
  defaultTax?: boolean;
  active?: boolean;
}
