export interface Product {
  id: number;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: number;
  unitId?: number;
  costPrice: number;
  sellingPrice: number;
  taxRate?: number;
  taxId?: number;
  trackStock?: boolean;
  lowStockThreshold?: number;
  active?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: number;
  unitId?: number;
  costPrice: number;
  sellingPrice: number;
  taxRate?: number;
  taxId?: number;
  trackStock?: boolean;
  lowStockThreshold?: number;
  active?: boolean;
  imageUrl?: string;
}
