import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { PermissionMap, UserRole } from '../models/user.model';

export interface RolePermissionDto {
  role?: UserRole;
  roleId?: number;
  permissions: PermissionMap;
}

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<RolePermissionDto[]> {
    return this.api.get<RolePermissionDto[]>(AppConstants.API.PERMISSIONS);
  }

  getByRole(role: UserRole): Observable<RolePermissionDto> {
    return this.api.get<RolePermissionDto>(AppConstants.API.PERMISSIONS_BY_ROLE(role));
  }

  getMine(): Observable<RolePermissionDto> {
    return this.api.get<RolePermissionDto>(AppConstants.API.PERMISSIONS_ME);
  }

  update(role: UserRole, permissions: PermissionMap): Observable<RolePermissionDto> {
    return this.api.put<RolePermissionDto>(AppConstants.API.PERMISSIONS_BY_ROLE(role), { permissions });
  }
}
