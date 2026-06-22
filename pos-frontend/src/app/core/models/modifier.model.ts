export interface ProductModifier {
  id: number;
  productId?: number;
  name: string;
  priceAdjustment: number;
  modifierGroup?: string;
  active?: boolean;
}

export interface SelectedModifier {
  id: number;
  name: string;
  priceAdjustment: number;
}
