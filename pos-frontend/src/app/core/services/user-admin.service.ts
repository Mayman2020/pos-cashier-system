import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { PosUser, UserRequest } from '../models/user-admin.model';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20, q?: string): Observable<SpringPage<PosUser>> {
    return this.api.get<SpringPage<PosUser>>(AppConstants.API.USERS, { page, size, q });
  }

  getById(id: number): Observable<PosUser> {
    return this.api.get<PosUser>(AppConstants.API.USER_BY_ID(id));
  }

  create(body: UserRequest): Observable<PosUser> {
    return this.api.post<PosUser>(AppConstants.API.USERS, body);
  }

  update(id: number, body: UserRequest): Observable<PosUser> {
    return this.api.put<PosUser>(AppConstants.API.USER_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.USER_BY_ID(id));
  }
}
