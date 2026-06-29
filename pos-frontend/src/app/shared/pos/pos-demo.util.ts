import { environment } from '../../../environments/environment';

/** Demo café/retail product images when running locally in dev mode */
const DEMO_BY_KEYWORD: [RegExp, string][] = [
  [/قهوة|كابتشينو|لاتيه|coffee|cappuccino|espresso/i, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop'],
  [/عصير|juice|برتقال|orange/i, 'https://images.unsplash.com/photo-1613478223719-2abff118dd51?w=400&h=300&fit=crop'],
  [/شاي|tea/i, 'https://images.unsplash.com/photo-1556678153-2d48f778f38a?w=400&h=300&fit=crop'],
  [/كيك|تورت|حلو|cake|sweet|bakery/i, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'],
  [/ماء|water/i, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop'],
  [/ساندويتش|سناك|snack|وجبات/i, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop'],
  [/مخبوز|bread|croissant/i, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'],
];

const DEFAULT_IMAGE = 'assets/images/product-placeholder.svg';
const DEV_DEMO_IMAGES_ENABLED = !environment.production;

export function resolveProductImage(imageUrl?: string | null, name?: string): string {
  if (imageUrl?.trim()) return imageUrl.trim();
  if (!DEV_DEMO_IMAGES_ENABLED) return DEFAULT_IMAGE;

  const n = name ?? '';
  for (const [re, url] of DEMO_BY_KEYWORD) {
    if (re.test(n)) return url;
  }
  return DEFAULT_IMAGE;
}
