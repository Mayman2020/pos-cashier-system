import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { Tax, TaxRequest } from '../models/tax.model';

@Injectable({ providedIn: 'root' })
export class TaxService {
  constructor(private readonly api: ApiService) {}

  list(): Observable<Tax[]> {
    return this.api.get<Tax[]>(AppConstants.API.TAXES);
  }

  create(body: TaxRequest): Observable<Tax> {
    return this.api.post<Tax>(AppConstants.API.TAXES, body);
  }

  update(id: number, body: TaxRequest): Observable<Tax> {
    return this.api.put<Tax>(AppConstants.API.TAX_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.TAX_BY_ID(id));
  }
}
