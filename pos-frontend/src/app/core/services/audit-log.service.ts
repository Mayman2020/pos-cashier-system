import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';

export interface AuditLog {
  id: number;
  branchId?: number;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: string;
  username?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  constructor(private readonly api: ApiService) {}

  list(page: number, size: number, branchId?: number): Observable<SpringPage<AuditLog>> {
    return this.api.get<SpringPage<AuditLog>>(AppConstants.API.AUDIT_LOGS, { page, size, branchId });
  }
}
