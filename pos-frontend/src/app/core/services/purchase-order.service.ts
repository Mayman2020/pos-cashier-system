import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { PurchaseOrder, PurchaseOrderRequest, PurchaseOrderStatus } from '../models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  constructor(private readonly api: ApiService) {}

  list(page: number, size: number, branchId?: number, status?: PurchaseOrderStatus): Observable<SpringPage<PurchaseOrder>> {
    return this.api.get<SpringPage<PurchaseOrder>>(AppConstants.API.PURCHASE_ORDERS, { page, size, branchId, status });
  }

  getById(id: number): Observable<PurchaseOrder> {
    return this.api.get<PurchaseOrder>(AppConstants.API.PURCHASE_ORDER_BY_ID(id));
  }

  create(branchId: number, body: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(AppConstants.API.PURCHASE_ORDERS, body, { branchId });
  }

  update(id: number, body: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.api.put<PurchaseOrder>(AppConstants.API.PURCHASE_ORDER_BY_ID(id), body);
  }

  receive(id: number): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(AppConstants.API.PURCHASE_ORDER_RECEIVE(id), {});
  }

  cancel(id: number): Observable<void> {
    return this.api.post<void>(AppConstants.API.PURCHASE_ORDER_CANCEL(id), {});
  }
}
