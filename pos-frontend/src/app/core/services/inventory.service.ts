import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import {
  InventoryBalance,
  StockAdjustRequest,
  StockInRequest,
  StockMovement,
  StockTransferRequest,
} from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private readonly api: ApiService) {}

  balances(page = 0, size = 20, branchId?: number): Observable<SpringPage<InventoryBalance>> {
    return this.api.get<SpringPage<InventoryBalance>>(AppConstants.API.INVENTORY_BALANCES, { page, size, branchId });
  }

  movements(page = 0, size = 20, branchId?: number, productId?: number): Observable<SpringPage<StockMovement>> {
    return this.api.get<SpringPage<StockMovement>>(AppConstants.API.INVENTORY_MOVEMENTS, { page, size, branchId, productId });
  }

  lowStock(branchId?: number): Observable<InventoryBalance[]> {
    return this.api.get<InventoryBalance[]>(AppConstants.API.INVENTORY_LOW_STOCK, { branchId });
  }

  stockIn(body: StockInRequest): Observable<StockMovement> {
    return this.api.post<StockMovement>(AppConstants.API.INVENTORY_STOCK_IN, body);
  }

  adjust(body: StockAdjustRequest): Observable<StockMovement> {
    return this.api.post<StockMovement>(AppConstants.API.INVENTORY_ADJUST, body);
  }

  transfer(body: StockTransferRequest): Observable<StockMovement> {
    return this.api.post<StockMovement>(AppConstants.API.INVENTORY_TRANSFER, body);
  }
}
