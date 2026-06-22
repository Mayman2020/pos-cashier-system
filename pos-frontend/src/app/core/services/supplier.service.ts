import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { Supplier, SupplierRequest } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20, q?: string): Observable<SpringPage<Supplier>> {
    return this.api.get<SpringPage<Supplier>>(AppConstants.API.SUPPLIERS, { page, size, q });
  }

  getById(id: number): Observable<Supplier> {
    return this.api.get<Supplier>(AppConstants.API.SUPPLIER_BY_ID(id));
  }

  create(body: SupplierRequest): Observable<Supplier> {
    return this.api.post<Supplier>(AppConstants.API.SUPPLIERS, body);
  }

  update(id: number, body: SupplierRequest): Observable<Supplier> {
    return this.api.put<Supplier>(AppConstants.API.SUPPLIER_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.SUPPLIER_BY_ID(id));
  }
}
