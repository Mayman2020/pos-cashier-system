import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';

export interface Expense {
  id: number;
  shiftId: number;
  movementType: string;
  amount: number;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  constructor(private readonly api: ApiService) {}

  list(page: number, size: number, branchId?: number): Observable<SpringPage<Expense>> {
    return this.api.get<SpringPage<Expense>>(AppConstants.API.EXPENSES, { page, size, branchId });
  }

  record(branchId: number, amount: number, notes?: string): Observable<Expense> {
    return this.api.post<Expense>(AppConstants.API.EXPENSES, { amount, notes }, { branchId });
  }
}
