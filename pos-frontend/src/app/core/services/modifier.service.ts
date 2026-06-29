import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ProductModifier } from '../models/modifier.model';

export interface ModifierRequest {
  productId?: number;
  name: string;
  priceAdjustment?: number;
  modifierGroup?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ModifierService {
  constructor(private readonly api: ApiService) {}

  list(productId?: number): Observable<ProductModifier[]> {
    return this.api.get<ProductModifier[]>(AppConstants.API.MODIFIERS, { productId });
  }

  create(body: ModifierRequest): Observable<ProductModifier> {
    return this.api.post<ProductModifier>(AppConstants.API.MODIFIERS, body);
  }

  update(id: number, body: ModifierRequest): Observable<ProductModifier> {
    return this.api.put<ProductModifier>(AppConstants.API.MODIFIER_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.MODIFIER_BY_ID(id));
  }
}
