import { environment } from '../../../environments/environment';

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
    baseURL: environment.apiUrl,

    AUTH_LOGIN: '/auth/login',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_LOGOUT: '/auth/logout',

    DASHBOARD_SUMMARY: '/dashboard/summary',

    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id: number) => `/products/${id}`,

    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id: number) => `/categories/${id}`,

    CUSTOMERS: '/customers',
    CUSTOMER_BY_ID: (id: number) => `/customers/${id}`,

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

    SHIFTS: '/shifts',
    SHIFTS_CURRENT: '/shifts/current',
    SHIFTS_OPEN: '/shifts/open',
    SHIFT_CLOSE: (id: number) => `/shifts/${id}/close`,

    REPORTS_DAILY_SALES: '/reports/daily-sales',
    REPORTS_MONTHLY_SALES: '/reports/monthly-sales',
    REPORTS_TOP_PRODUCTS: '/reports/top-products',
    REPORTS_PROFIT: '/reports/profit',
    REPORTS_PAYMENT_METHODS: '/reports/payment-methods',
    REPORTS_CASHIER_SALES: '/reports/cashier-sales',
    REPORTS_BRANCH_SALES: '/reports/branch-sales',
    REPORTS_LOW_STOCK: '/reports/low-stock',

    SETTINGS: '/settings',

    RECEIPT: (orderId: number) => `/receipts/${orderId}`,

    MODIFIERS: '/modifiers',
    TABLES: '/tables',
    TABLE_BY_ID: (id: number) => `/tables/${id}`,

    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,

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
