import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
  const role = auth.getRole();
  if (role && allowedRoles.includes(role)) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};

export const adminGuard: CanActivateFn = roleGuard(['ADMIN']);
export const managerGuard: CanActivateFn = roleGuard(['ADMIN', 'MANAGER']);
export const cashierGuard: CanActivateFn = roleGuard(['ADMIN', 'MANAGER', 'CASHIER']);
