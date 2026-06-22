import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TranslateService } from '@ngx-translate/core';
import { AppConstants } from '../constants/app-constants';
import {
  ARABIC_LATIN_DIGITS_LANG,
  formatCurrency as formatCurrencyLatin,
  formatDateTime as formatDateTimeLatin,
  formatNumber as formatNumberLatin,
  toLatinDigits as toLatinDigitsUtil,
} from './locale-format';

export type LangCode = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages = [
    { code: 'ar' as LangCode, label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' as Direction },
    { code: 'en' as LangCode, label: 'English', nativeLabel: 'English', dir: 'ltr' as Direction },
  ];

  constructor(
    private readonly translate: TranslateService,
    private readonly overlayContainer: OverlayContainer
  ) {
    this.translate.addLangs(['ar', 'en']);
    this.translate.setDefaultLang('ar');
    const saved = this.readSavedLanguage();
    this.setLang(saved).subscribe({ error: () => {} });
  }

  get currentLang(): LangCode {
    return (this.translate.currentLang as LangCode) || 'ar';
  }

  get isRtl(): boolean {
    return this.currentLang === 'ar';
  }

  setLang(code: LangCode) {
    const lang = code === 'en' ? 'en' : 'ar';
    localStorage.setItem(AppConstants.PERSISTED_KEYS.LANG, lang);
    this.applyLang(lang);
    return this.translate.use(lang);
  }

  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
    return formatNumberLatin(value, options);
  }

  formatCurrency(value: number | null | undefined, currency = 'SAR', options?: Intl.NumberFormatOptions): string {
    return formatCurrencyLatin(value, currency, options);
  }

  formatDateTime(value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    return formatDateTimeLatin(value, options, this.currentLang);
  }

  toLatinDigits(text: string | number | null | undefined): string {
    return toLatinDigitsUtil(text);
  }

  private applyLang(code: LangCode): void {
    const dir = code === 'ar' ? 'rtl' : 'ltr';
    const htmlLang = code === 'ar' ? ARABIC_LATIN_DIGITS_LANG : 'en';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', htmlLang);
    document.body.setAttribute('dir', dir);
    try {
      this.overlayContainer.getContainerElement().setAttribute('dir', dir);
    } catch {
      /* early bootstrap */
    }
  }

  private readSavedLanguage(): LangCode {
    const saved = localStorage.getItem(AppConstants.PERSISTED_KEYS.LANG);
    return saved === 'en' ? 'en' : 'ar';
  }
}
