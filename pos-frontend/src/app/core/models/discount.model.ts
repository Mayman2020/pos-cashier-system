export type DiscountType = 'PERCENT' | 'FIXED';

export interface Discount {
  id: number;
  code: string;
  name: string;
  discountType: DiscountType;
  value: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscountRequest {
  code: string;
  name: string;
  discountType: DiscountType;
  value: number;
  active?: boolean;
}
