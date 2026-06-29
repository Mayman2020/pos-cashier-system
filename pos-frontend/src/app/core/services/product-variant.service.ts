import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ProductVariant, ProductVariantRequest } from '../models/product-variant.model';

@Injectable({ providedIn: 'root' })
export class ProductVariantService {
  constructor(private readonly api: ApiService) {}

  list(productId: number): Observable<ProductVariant[]> {
    return this.api.get<ProductVariant[]>(AppConstants.API.PRODUCT_VARIANTS(productId));
  }

  create(productId: number, body: ProductVariantRequest): Observable<ProductVariant> {
    return this.api.post<ProductVariant>(AppConstants.API.PRODUCT_VARIANTS(productId), body);
  }

  update(productId: number, variantId: number, body: ProductVariantRequest): Observable<ProductVariant> {
    return this.api.put<ProductVariant>(AppConstants.API.PRODUCT_VARIANT_BY_ID(productId, variantId), body);
  }

  delete(productId: number, variantId: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.PRODUCT_VARIANT_BY_ID(productId, variantId));
  }
}
