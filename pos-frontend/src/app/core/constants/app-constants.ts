import { environment } from '../../../environments/environment';

type RuntimeWindow = Window & { __POS_API_URL__?: string };

function getRuntimeApiBaseUrl(): string {
  const runtimeApiUrl = typeof window !== 'undefined'
    ? (window as RuntimeWindow).__POS_API_URL__
    : undefined;
  return runtimeApiUrl?.trim() || environment.apiUrl;
}

export const HTTP_HEADERS = {
  ACTIVE_ROLE: 'X-Active-Role',
} as const;

export const AppConstants = {
  PERSISTED_KEYS: {
    ACCESS_TOKEN: 'pos_access_token',
    REFRESH_TOKEN: 'pos_refresh_token',
    CURRENT_USER: 'pos_current_user',
    LANG: 'pos_lang',
  },

  API: {
    baseURL: getRuntimeApiBaseUrl(),

    AUTH_LOGIN: '/auth/login',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_LOGOUT: '/auth/logout',

    DASHBOARD_SUMMARY: '/dashboard/summary',

    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id: number) => `/products/${id}`,
    PRODUCT_VARIANTS: (productId: number) => `/products/${productId}/variants`,
    PRODUCT_VARIANT_BY_ID: (productId: number, variantId: number) => `/products/${productId}/variants/${variantId}`,

    UNITS: '/units',
    UNIT_BY_ID: (id: number) => `/units/${id}`,

    FILES: '/files',

    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id: number) => `/categories/${id}`,

    CUSTOMERS: '/customers',
    CUSTOMER_BY_ID: (id: number) => `/customers/${id}`,
    CUSTOMER_LOYALTY_TRANSACTIONS: (id: number) => `/customers/${id}/loyalty/transactions`,
    CUSTOMER_LOYALTY_ADJUST: (id: number) => `/customers/${id}/loyalty/adjust`,

    PURCHASE_ORDERS: '/purchase-orders',
    PURCHASE_ORDER_BY_ID: (id: number) => `/purchase-orders/${id}`,
    PURCHASE_ORDER_RECEIVE: (id: number) => `/purchase-orders/${id}/receive`,
    PURCHASE_ORDER_CANCEL: (id: number) => `/purchase-orders/${id}/cancel`,

    EXPENSES: '/expenses',

    AUDIT_LOGS: '/audit-logs',

    MODIFIER_BY_ID: (id: number) => `/modifiers/${id}`,

    SUPPLIERS: '/suppliers',
    SUPPLIER_BY_ID: (id: number) => `/suppliers/${id}`,

    POS_ORDERS: '/pos/orders',
    POS_ORDER_BY_ID: (id: number) => `/pos/orders/${id}`,
    POS_ORDER_PAY: (id: number) => `/pos/orders/${id}/pay`,
    POS_ORDER_HOLD: (id: number) => `/pos/orders/${id}/hold`,
    POS_ORDER_CANCEL: (id: number) => `/pos/orders/${id}/cancel`,
    POS_ORDER_RESUME: (id: number) => `/pos/orders/${id}/resume`,
    POS_ORDER_REFUND: (id: number) => `/pos/orders/${id}/refund`,

    INVENTORY_BALANCES: '/inventory/balances',
    INVENTORY_MOVEMENTS: '/inventory/movements',
    INVENTORY_LOW_STOCK: '/inventory/low-stock',
    INVENTORY_STOCK_IN: '/inventory/stock-in',
    INVENTORY_ADJUST: '/inventory/adjust',
    INVENTORY_TRANSFER: '/inventory/transfer',
    INVENTORY_AVAILABILITY: '/inventory/availability',

    SHIFTS: '/shifts',
    SHIFTS_CURRENT: '/shifts/current',
    SHIFTS_OPEN: '/shifts/open',
    SHIFT_BY_ID: (id: number) => `/shifts/${id}`,
    SHIFT_CLOSE: (id: number) => `/shifts/${id}/close`,
    SHIFT_PAYOUT: (id: number) => `/shifts/${id}/payout`,
    SHIFT_DRAWER_MOVEMENTS: (id: number) => `/shifts/${id}/drawer-movements`,

    REPORTS_DAILY_SALES: '/reports/daily-sales',
    REPORTS_MONTHLY_SALES: '/reports/monthly-sales',
    REPORTS_TOP_PRODUCTS: '/reports/top-products',
    REPORTS_PROFIT: '/reports/profit',
    REPORTS_PAYMENT_METHODS: '/reports/payment-methods',
    REPORTS_CASHIER_SALES: '/reports/cashier-sales',
    REPORTS_BRANCH_SALES: '/reports/branch-sales',
    REPORTS_LOW_STOCK: '/reports/low-stock',

    SETTINGS: '/settings',
    SETTINGS_POS: '/settings/pos',

    RECEIPT: (orderId: number) => `/receipts/${orderId}`,

    MODIFIERS: '/modifiers',
    TABLES: '/tables',
    TABLE_BY_ID: (id: number) => `/tables/${id}`,

    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
    USERS_TOGGLE_ACTIVE: (id: number) => `/users/${id}/toggle-active`,
    USERS_ME: '/users/me',
    USERS_ME_CHANGE_PASSWORD: '/users/me/change-password',

    PERMISSIONS: '/permissions',
    PERMISSIONS_BY_ROLE: (role: string) => `/permissions/${role}`,
    PERMISSIONS_ME: '/permissions/mine',

    LOOKUPS_BY_TYPE: '/lookups/by-type',
    LOOKUPS_ADMIN_BY_TYPE: '/lookups/admin/by-type',
    LOOKUPS: '/lookups',
    LOOKUP_BY_ID: (id: number) => `/lookups/${id}`,

    BRANCHES: '/branches',
    BRANCH_BY_ID: (id: number) => `/branches/${id}`,

    TAXES: '/taxes',
    TAX_BY_ID: (id: number) => `/taxes/${id}`,

    DISCOUNTS: '/discounts',
    DISCOUNT_BY_ID: (id: number) => `/discounts/${id}`,

    KITCHEN_QUEUE: '/kitchen/queue',
    KITCHEN_ORDER_STATUS: (id: number) => `/kitchen/orders/${id}/status`,
  },
} as const;

export function shouldSkipGlobalLoaderForUpload(url: string, method: string): boolean {
  return (method ?? '').toUpperCase() === 'POST' && (url ?? '').includes('/upload');
}
