import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { TokenStorageService } from '../auth/token-storage.service';
import { JwtUtils } from '../utils/jwt-utils';
import { CurrentUser, LoginRequest, LoginResponse, PermissionMap, UserDto, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly api: ApiService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(AppConstants.API.AUTH_LOGIN, request).pipe(
      tap((data) => {
        if (data?.accessToken) {
          this.tokenStorage.setToken(data.accessToken);
          if (data.refreshToken) this.tokenStorage.setRefreshToken(data.refreshToken);
          const userDto = data.user;
          if (userDto) this.persistUser(userDto);
        }
      })
    );
  }

  logout(): void {
    this.api.post<void>(AppConstants.API.AUTH_LOGOUT, {}).subscribe({ error: () => {} });
    this.tokenStorage.clearAll();
    void this.router.navigateByUrl('/auth/login');
  }

  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) return false;
    return !JwtUtils.isExpired(token);
  }

  getCurrentUser(): CurrentUser | null {
    return this.tokenStorage.getUser<CurrentUser>();
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  getPermissions(): PermissionMap {
    return this.getCurrentUser()?.permissions ?? {};
  }

  updateStoredPermissions(permissions: PermissionMap): void {
    const user = this.getCurrentUser();
    if (user) this.tokenStorage.setUser({ ...user, permissions });
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === role || user.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isManager(): boolean {
    return this.hasRole('MANAGER');
  }

  isCashier(): boolean {
    return this.hasRole('CASHIER');
  }

  getDashboardRoute(): string {
    return '/admin/dashboard';
  }

  mustChangePassword(): boolean {
    return this.getCurrentUser()?.mustChangePassword === true;
  }

  clearMustChangePassword(): void {
    const user = this.getCurrentUser();
    if (user) this.tokenStorage.setUser({ ...user, mustChangePassword: false });
  }

  clearExpiredTokens(): void {
    const token = this.tokenStorage.getToken();
    if (token && JwtUtils.isExpired(token)) this.tokenStorage.clearAll();
  }

  private persistUser(userDto: UserDto): void {
    const roles = (userDto.roles ?? []).filter((r): r is UserRole =>
      r === 'ADMIN' || r === 'MANAGER' || r === 'CASHIER'
    );
    const primary = roles[0] ?? 'CASHIER';
    const user: CurrentUser = {
      id: userDto.id,
      username: userDto.username,
      email: userDto.email,
      fullName: userDto.fullName,
      branchId: userDto.branchId,
      role: primary,
      roles: roles.length ? roles : [primary],
      mustChangePassword: userDto.mustChangePassword ?? false,
      permissions: userDto.permissions ?? {},
      initials: this.buildInitials(userDto.fullName || userDto.username),
    };
    this.tokenStorage.setUser(user);
  }

  private buildInitials(name: string): string {
    const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'U';
    return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  }
}
