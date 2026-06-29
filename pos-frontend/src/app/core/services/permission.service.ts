import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { PermissionAction, PermissionMap } from '../models/user.model';
import { RolePermissionDto, RolePermissionService } from './role-permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissions: PermissionMap = {};

  constructor(
    private readonly auth: AuthService,
    private readonly rolePermissionService: RolePermissionService
  ) {
    this.permissions = this.auth.getPermissions();
  }

  loadMine(): Observable<RolePermissionDto | null> {
    if (!this.auth.isAuthenticated()) {
      this.permissions = {};
      return of(null);
    }
    return this.rolePermissionService.getMine().pipe(
      tap((dto) => {
        const nextPermissions = dto?.permissions ?? {};
        this.permissions = nextPermissions;
        this.auth.updateStoredPermissions(nextPermissions);
      }),
      catchError(() => {
        this.permissions = this.auth.getPermissions();
        return of(null);
      })
    );
  }

  can(moduleKey: string, action: PermissionAction = 'view'): boolean {
    if (this.auth.getRole() === 'ADMIN') return true;
    const modulePermissions = this.permissions[moduleKey];
    if (!modulePermissions) return false;
    if (modulePermissions.enabled === false) return false;
    return modulePermissions[action] === true;
  }

  getPermissions(): PermissionMap {
    return this.permissions;
  }
}
