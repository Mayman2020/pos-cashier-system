import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ProductModifier } from '../models/modifier.model';

@Injectable({ providedIn: 'root' })
export class ModifierService {
  constructor(private readonly api: ApiService) {}

  list(productId?: number): Observable<ProductModifier[]> {
    return this.api.get<ProductModifier[]>(AppConstants.API.MODIFIERS, { productId });
  }
}
