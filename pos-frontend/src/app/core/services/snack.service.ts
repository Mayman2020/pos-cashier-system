import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../i18n/i18n.service';

@Injectable({ providedIn: 'root' })
export class SnackService {
  constructor(
    private readonly snack: MatSnackBar,
    private readonly i18n: I18nService
  ) {}

  success(message: string): void {
    this.snack.open(message, undefined, { duration: 3500, panelClass: ['success-snack'] });
  }

  error(message: string): void {
    this.snack.open(message, undefined, { duration: 5000, panelClass: ['error-snack'] });
  }

  errorFrom(err: unknown, fallbackKey = 'ERRORS.GENERIC'): void {
    const msg = err instanceof Error && err.message ? err.message : this.i18n.instant(fallbackKey);
    this.error(msg);
  }

  info(message: string): void {
    this.snack.open(message, undefined, { duration: 3500, panelClass: ['info-snack'] });
  }
}
