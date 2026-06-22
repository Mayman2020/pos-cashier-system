import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { Branch, BranchRequest } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20, q?: string): Observable<SpringPage<Branch>> {
    return this.api.get<SpringPage<Branch>>(AppConstants.API.BRANCHES, { page, size, q });
  }

  getById(id: number): Observable<Branch> {
    return this.api.get<Branch>(AppConstants.API.BRANCH_BY_ID(id));
  }

  create(body: BranchRequest): Observable<Branch> {
    return this.api.post<Branch>(AppConstants.API.BRANCHES, body);
  }

  update(id: number, body: BranchRequest): Observable<Branch> {
    return this.api.put<Branch>(AppConstants.API.BRANCH_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.BRANCH_BY_ID(id));
  }
}
