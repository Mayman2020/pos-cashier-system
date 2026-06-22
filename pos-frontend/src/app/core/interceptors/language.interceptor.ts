import { HttpInterceptorFn } from '@angular/common/http';
import { AppConstants } from '../constants/app-constants';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const saved = localStorage.getItem(AppConstants.PERSISTED_KEYS.LANG);
  const lang = saved === 'ar' || saved === 'en' ? saved : 'ar';
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
