export const ARABIC_LATIN_DIGITS_LANG = 'ar-u-nu-latn';

export function toLatinDigits(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

export function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return toLatinDigits(new Intl.NumberFormat('en-US', options).format(value));
}

export function formatCurrency(
  value: number | null | undefined,
  currency = 'SAR',
  options?: Intl.NumberFormatOptions
): string {
  return formatNumber(value, { style: 'currency', currency, minimumFractionDigits: 2, ...options });
}

export function formatDateTime(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  lang: 'ar' | 'en' = 'en'
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const locale = lang === 'ar' ? ARABIC_LATIN_DIGITS_LANG : 'en-GB';
  return toLatinDigits(new Intl.DateTimeFormat(locale, options).format(date));
}
