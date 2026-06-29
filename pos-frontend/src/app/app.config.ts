import { ApplicationConfig, APP_INITIALIZER, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { DateFormatAdapter } from './core/adapters/date-format.adapter';
import { DD_MM_YYYY_DATE_FORMATS } from './core/constants/date-formats';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { PermissionService } from './core/services/permission.service';
import { AppConstants } from './core/constants/app-constants';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (theme: ThemeService) => () => {
        theme.mode();
      },
      deps: [ThemeService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.clearExpiredTokens(),
      deps: [AuthService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (permissions: PermissionService) => () => {
        void permissions.loadMine().subscribe({ error: () => {} });
      },
      deps: [PermissionService],
      multi: true,
    },
    provideRouter(routes),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: DateFormatAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_DATE_FORMATS },
    provideHttpClient(withInterceptors([loadingInterceptor, languageInterceptor, authInterceptor, errorInterceptor])),
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useFactory: () => ({
        direction: localStorage.getItem(AppConstants.PERSISTED_KEYS.LANG) === 'en' ? 'ltr' : 'rtl',
        maxWidth: '95vw',
      }),
    },
    importProvidersFrom(
      MatSnackBarModule,
      MatDialogModule,
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateHttpLoader },
      })
    ),
  ],
};
