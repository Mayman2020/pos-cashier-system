import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import {
  CreateOrderRequest,
  OrderStatus,
  PayOrderRequest,
  PosOrder,
  UpdateOrderRequest,
  RefundOrderRequest,
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20, branchId?: number, status?: OrderStatus, q?: string): Observable<SpringPage<PosOrder>> {
    return this.api.get<SpringPage<PosOrder>>(AppConstants.API.POS_ORDERS, { page, size, branchId, status, q });
  }

  getById(id: number): Observable<PosOrder> {
    return this.api.get<PosOrder>(AppConstants.API.POS_ORDER_BY_ID(id));
  }

  create(body: CreateOrderRequest): Observable<PosOrder> {
    return this.api.post<PosOrder>(AppConstants.API.POS_ORDERS, body);
  }

  update(id: number, body: UpdateOrderRequest): Observable<PosOrder> {
    return this.api.put<PosOrder>(AppConstants.API.POS_ORDER_BY_ID(id), body);
  }

  pay(id: number, body: PayOrderRequest): Observable<PosOrder> {
    return this.api.post<PosOrder>(AppConstants.API.POS_ORDER_PAY(id), body);
  }

  hold(id: number): Observable<PosOrder> {
    return this.api.post<PosOrder>(AppConstants.API.POS_ORDER_HOLD(id), {});
  }

  cancel(id: number): Observable<PosOrder> {
    return this.api.post<PosOrder>(AppConstants.API.POS_ORDER_CANCEL(id), {});
  }

  resume(id: number): Observable<PosOrder> {
    return this.api.post<PosOrder>(AppConstants.API.POS_ORDER_RESUME(id), {});
  }

  refund(id: number, body?: RefundOrderRequest): Observable<PosOrder> {
    return this.api.post<PosOrder>(AppConstants.API.POS_ORDER_REFUND(id), body ?? {});
  }
}
