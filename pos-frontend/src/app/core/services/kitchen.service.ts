import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { PosOrder } from '../models/order.model';

export type KitchenStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';

@Injectable({ providedIn: 'root' })
export class KitchenService {
  constructor(private readonly api: ApiService) {}

  queue(branchId?: number): Observable<PosOrder[]> {
    return this.api.get<PosOrder[]>(AppConstants.API.KITCHEN_QUEUE, { branchId });
  }

  updateStatus(orderId: number, kitchenStatus: KitchenStatus): Observable<PosOrder> {
    return this.api.patch<PosOrder>(AppConstants.API.KITCHEN_ORDER_STATUS(orderId), { kitchenStatus });
  }
}
