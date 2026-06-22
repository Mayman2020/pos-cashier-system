import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { Customer, CustomerRequest } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20, q?: string): Observable<SpringPage<Customer>> {
    return this.api.get<SpringPage<Customer>>(AppConstants.API.CUSTOMERS, { page, size, q });
  }

  getById(id: number): Observable<Customer> {
    return this.api.get<Customer>(AppConstants.API.CUSTOMER_BY_ID(id));
  }

  create(body: CustomerRequest): Observable<Customer> {
    return this.api.post<Customer>(AppConstants.API.CUSTOMERS, body);
  }

  update(id: number, body: CustomerRequest): Observable<Customer> {
    return this.api.put<Customer>(AppConstants.API.CUSTOMER_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.CUSTOMER_BY_ID(id));
  }
}
