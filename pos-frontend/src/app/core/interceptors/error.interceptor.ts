import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TokenStorageService } from '../auth/token-storage.service';
import { AppConstants } from '../constants/app-constants';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes(AppConstants.API.AUTH_LOGIN)) {
        tokenStorage.clearAll();
        void router.navigateByUrl('/auth/login');
      }
      const body = err.error;
      let message = err.message || translate.instant('ERRORS.GENERIC');
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        message = (body as { message?: string }).message || message;
      }
      const normalized = new Error(message) as Error & { status?: number };
      normalized.status = err.status;
      return throwError(() => normalized);
    })
  );
};
