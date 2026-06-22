import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getSummary(branchId?: number): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>(AppConstants.API.DASHBOARD_SUMMARY, { branchId });
  }
}
