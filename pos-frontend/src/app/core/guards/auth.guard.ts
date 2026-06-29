import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionAction, UserRole } from '../models/user.model';
import { PermissionService } from '../services/permission.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return router.createUrlTree([auth.getDashboardRoute()]);
  return true;
};

export const roleGuard = (roles: UserRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  const role = auth.getRole();
  return role && roles.includes(role) ? true : router.createUrlTree([auth.getDashboardRoute()]);
};

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const perms = inject(PermissionService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  const key = route.data['permission'] as string | undefined;
  const action = (route.data['permissionAction'] as PermissionAction | undefined) ?? 'view';
  if (!key || perms.can(key, action)) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};

export const mustChangePasswordGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.mustChangePassword()) return true;
  if (state.url.includes('/admin/profile')) return true;
  return router.createUrlTree(['/admin/profile'], { queryParams: { changePassword: '1' } });
};
