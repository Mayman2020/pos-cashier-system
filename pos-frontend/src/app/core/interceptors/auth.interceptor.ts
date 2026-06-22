import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { HTTP_HEADERS } from '../constants/app-constants';
import { CurrentUser } from '../models/user.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();
  const user = tokenStorage.getUser<CurrentUser>();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (user?.role) headers[HTTP_HEADERS.ACTIVE_ROLE] = user.role;
  if (Object.keys(headers).length) req = req.clone({ setHeaders: headers });
  return next(req);
};
