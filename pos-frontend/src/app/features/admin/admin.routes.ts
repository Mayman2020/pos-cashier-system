import { Routes } from '@angular/router';
import { authGuard, mustChangePasswordGuard, permissionGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, mustChangePasswordGuard],
    loadComponent: () => import('../../layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [permissionGuard],
        data: { permission: 'dashboard' },
        loadComponent: () => import('../dashboard/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'pos',
        canActivate: [permissionGuard],
        data: { permission: 'pos' },
        loadComponent: () => import('../pos/pos-cashier/pos-cashier.component').then((m) => m.PosCashierComponent),
      },
      {
        path: 'products',
        canActivate: [permissionGuard],
        data: { permission: 'products' },
        loadComponent: () => import('../products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'categories',
        canActivate: [permissionGuard],
        data: { permission: 'categories' },
        loadComponent: () => import('../categories/category-list/category-list.component').then((m) => m.CategoryListComponent),
      },
      {
        path: 'units',
        canActivate: [permissionGuard],
        data: { permission: 'units' },
        loadComponent: () => import('../units/unit-list/unit-list.component').then((m) => m.UnitListComponent),
      },
      {
        path: 'inventory',
        canActivate: [permissionGuard],
        data: { permission: 'inventory' },
        loadComponent: () => import('../inventory/inventory-page/inventory-page.component').then((m) => m.InventoryPageComponent),
      },
      {
        path: 'customers',
        canActivate: [permissionGuard],
        data: { permission: 'customers' },
        loadComponent: () => import('../customers/customer-list/customer-list.component').then((m) => m.CustomerListComponent),
      },
      {
        path: 'suppliers',
        canActivate: [permissionGuard],
        data: { permission: 'suppliers' },
        loadComponent: () => import('../suppliers/supplier-list/supplier-list.component').then((m) => m.SupplierListComponent),
      },
      {
        path: 'orders',
        canActivate: [permissionGuard],
        data: { permission: 'orders' },
        loadComponent: () => import('../orders/order-list/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'shifts',
        canActivate: [permissionGuard],
        data: { permission: 'shifts' },
        loadComponent: () => import('../shifts/shift-list/shift-list.component').then((m) => m.ShiftListComponent),
      },
      {
        path: 'reports',
        canActivate: [permissionGuard],
        data: { permission: 'reports' },
        loadComponent: () => import('../reports/reports-page/reports-page.component').then((m) => m.ReportsPageComponent),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { permission: 'settings' },
        loadComponent: () => import('../settings/settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permission: 'users' },
        loadComponent: () => import('../users/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'branches',
        canActivate: [permissionGuard],
        data: { permission: 'branches' },
        loadComponent: () => import('../branches/branch-list/branch-list.component').then((m) => m.BranchListComponent),
      },
      {
        path: 'tables',
        canActivate: [permissionGuard],
        data: { permission: 'tables' },
        loadComponent: () => import('../tables/table-list/table-list.component').then((m) => m.TableListComponent),
      },
      {
        path: 'taxes',
        canActivate: [permissionGuard],
        data: { permission: 'taxes' },
        loadComponent: () => import('../taxes/tax-list/tax-list.component').then((m) => m.TaxListComponent),
      },
      {
        path: 'discounts',
        canActivate: [permissionGuard],
        data: { permission: 'discounts' },
        loadComponent: () => import('../discounts/discount-list/discount-list.component').then((m) => m.DiscountListComponent),
      },
      {
        path: 'kitchen',
        canActivate: [permissionGuard],
        data: { permission: 'kitchen' },
        loadComponent: () => import('../kitchen/kitchen-display/kitchen-display.component').then((m) => m.KitchenDisplayComponent),
      },
      {
        path: 'purchase-orders',
        canActivate: [permissionGuard],
        data: { permission: 'purchase_orders' },
        loadComponent: () => import('../purchase-orders/purchase-order-list/purchase-order-list.component').then((m) => m.PurchaseOrderListComponent),
      },
      {
        path: 'expenses',
        canActivate: [permissionGuard],
        data: { permission: 'expenses' },
        loadComponent: () => import('../expenses/expense-page/expense-page.component').then((m) => m.ExpensePageComponent),
      },
      {
        path: 'audit-logs',
        canActivate: [permissionGuard],
        data: { permission: 'audit' },
        loadComponent: () => import('../audit/audit-log-page/audit-log-page.component').then((m) => m.AuditLogPageComponent),
      },
      {
        path: 'permissions',
        canActivate: [permissionGuard],
        data: { permission: 'settings' },
        loadComponent: () => import('../permissions/permissions-page/permissions-page.component').then((m) => m.PermissionsPageComponent),
      },
      {
        path: 'lookups',
        canActivate: [permissionGuard],
        data: { permission: 'settings' },
        loadComponent: () => import('../lookups/lookup-management/lookup-management.component').then((m) => m.LookupManagementComponent),
      },
      {
        path: 'profile',
        canActivate: [permissionGuard],
        data: { permission: 'profile' },
        loadComponent: () => import('../profile/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
];
