import { Product } from '../../core/models/product.model';
import { ProductVariant } from '../../core/models/product-variant.model';
import { SelectedModifier } from '../../core/models/modifier.model';

export interface PosCartLine {
  product: Product;
  variantId?: number;
  variant?: ProductVariant;
  quantity: number;
  discountAmount?: number;
  notes?: string;
  modifiers: SelectedModifier[];
  modifiersJson?: string;
}
