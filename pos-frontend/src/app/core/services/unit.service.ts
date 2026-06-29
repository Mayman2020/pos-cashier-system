import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { Unit, UnitRequest } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 50, q?: string): Observable<SpringPage<Unit>> {
    return this.api.get<SpringPage<Unit>>(AppConstants.API.UNITS, { page, size, q });
  }

  create(body: UnitRequest): Observable<Unit> {
    return this.api.post<Unit>(AppConstants.API.UNITS, body);
  }

  update(id: number, body: UnitRequest): Observable<Unit> {
    return this.api.put<Unit>(AppConstants.API.UNIT_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.UNIT_BY_ID(id));
  }
}
