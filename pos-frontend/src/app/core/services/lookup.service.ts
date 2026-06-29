import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';

export type LookupType =
  | 'ORDER_CHANNEL'
  | 'PAYMENT_METHOD'
  | 'TABLE_ZONE'
  | 'INVENTORY_UNIT'
  | 'EXPENSE_TYPE';

export interface LookupItem {
  id: number;
  type: LookupType;
  code: string;
  nameAr: string;
  nameEn: string;
  parentId?: number;
  sortOrder: number;
  active: boolean;
  locked: boolean;
}

export interface CreateLookupRequest {
  type: LookupType;
  code?: string;
  nameAr: string;
  nameEn: string;
  sortOrder?: number;
}

export interface UpdateLookupRequest {
  code: string;
  nameAr: string;
  nameEn: string;
  sortOrder?: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class LookupService {
  constructor(private readonly api: ApiService) {}

  getByType(type: LookupType): Observable<LookupItem[]> {
    return this.api.get<LookupItem[]>(AppConstants.API.LOOKUPS_BY_TYPE, { type });
  }

  getAllByType(type: LookupType): Observable<LookupItem[]> {
    return this.api.get<LookupItem[]>(AppConstants.API.LOOKUPS_ADMIN_BY_TYPE, { type });
  }

  create(request: CreateLookupRequest): Observable<LookupItem> {
    return this.api.post<LookupItem>(AppConstants.API.LOOKUPS, request);
  }

  update(id: number, request: UpdateLookupRequest): Observable<LookupItem> {
    return this.api.put<LookupItem>(AppConstants.API.LOOKUP_BY_ID(id), request);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.LOOKUP_BY_ID(id));
  }
}
