export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  barcode?: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  active?: boolean;
}

export interface ProductVariantRequest {
  sku: string;
  barcode?: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  active?: boolean;
}
