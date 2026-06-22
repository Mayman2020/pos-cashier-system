import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { CloseShiftRequest, OpenShiftRequest, Shift, ShiftStatus } from '../models/shift.model';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20, branchId?: number, cashierId?: number, status?: ShiftStatus): Observable<SpringPage<Shift>> {
    return this.api.get<SpringPage<Shift>>(AppConstants.API.SHIFTS, { page, size, branchId, cashierId, status });
  }

  getCurrentOpen(): Observable<Shift | null> {
    return this.api.get<Shift | null>(AppConstants.API.SHIFTS_CURRENT);
  }

  open(body: OpenShiftRequest): Observable<Shift> {
    return this.api.post<Shift>(AppConstants.API.SHIFTS_OPEN, body);
  }

  close(id: number, body: CloseShiftRequest): Observable<Shift> {
    return this.api.post<Shift>(AppConstants.API.SHIFT_CLOSE(id), body);
  }
}
