import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { shouldSkipGlobalLoaderForUpload } from '../constants/app-constants';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url ?? '';
  const method = req.method.toUpperCase();
  const isStaticAsset = url.includes('/assets/i18n/');
  const isBackgroundGet = method === 'GET';
  const isAuthFlow = url.includes('/auth/login') || url.includes('/auth/logout') || url.includes('/auth/refresh');
  const isMultipartUpload = shouldSkipGlobalLoaderForUpload(url, method);

  if (isStaticAsset || isBackgroundGet || isMultipartUpload || isAuthFlow) {
    return next(req);
  }

  const loading = inject(LoadingService);
  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
