import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { Discount, DiscountRequest } from '../models/discount.model';

@Injectable({ providedIn: 'root' })
export class DiscountService {
  constructor(private readonly api: ApiService) {}

  list(): Observable<Discount[]> {
    return this.api.get<Discount[]>(AppConstants.API.DISCOUNTS);
  }

  create(body: DiscountRequest): Observable<Discount> {
    return this.api.post<Discount>(AppConstants.API.DISCOUNTS, body);
  }

  update(id: number, body: DiscountRequest): Observable<Discount> {
    return this.api.put<Discount>(AppConstants.API.DISCOUNT_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.DISCOUNT_BY_ID(id));
  }
}
