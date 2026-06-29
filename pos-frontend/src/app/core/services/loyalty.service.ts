import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { Customer } from '../models/customer.model';

export interface LoyaltyTransaction {
  id: number;
  customerId: number;
  orderId?: number;
  transactionType: 'EARN' | 'REDEEM' | 'ADJUST';
  points: number;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  constructor(private readonly api: ApiService) {}

  transactions(customerId: number): Observable<LoyaltyTransaction[]> {
    return this.api.get<LoyaltyTransaction[]>(AppConstants.API.CUSTOMER_LOYALTY_TRANSACTIONS(customerId));
  }

  adjust(customerId: number, points: number, notes?: string): Observable<Customer> {
    return this.api.post<Customer>(AppConstants.API.CUSTOMER_LOYALTY_ADJUST(customerId), { points, notes });
  }
}
