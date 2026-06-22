import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { RestaurantTable, TableRequest } from '../models/table.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  constructor(private readonly api: ApiService) {}

  list(branchId?: number): Observable<RestaurantTable[]> {
    return this.api.get<RestaurantTable[]>(AppConstants.API.TABLES, { branchId });
  }

  create(body: TableRequest): Observable<RestaurantTable> {
    return this.api.post<RestaurantTable>(AppConstants.API.TABLES, body);
  }

  update(id: number, body: TableRequest): Observable<RestaurantTable> {
    return this.api.put<RestaurantTable>(AppConstants.API.TABLE_BY_ID(id), body);
  }
}
