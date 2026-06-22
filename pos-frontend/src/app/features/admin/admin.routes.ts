import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { managerGuard, cashierGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../dashboard/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'pos',
        canActivate: [authGuard, cashierGuard],
        loadComponent: () => import('../pos/pos-cashier/pos-cashier.component').then((m) => m.PosCashierComponent),
      },
      {
        path: 'products',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'categories',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../categories/category-list/category-list.component').then((m) => m.CategoryListComponent),
      },
      {
        path: 'inventory',
        canActivate: [authGuard, cashierGuard],
        loadComponent: () => import('../inventory/inventory-page/inventory-page.component').then((m) => m.InventoryPageComponent),
      },
      {
        path: 'customers',
        canActivate: [authGuard, cashierGuard],
        loadComponent: () => import('../customers/customer-list/customer-list.component').then((m) => m.CustomerListComponent),
      },
      {
        path: 'suppliers',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../suppliers/supplier-list/supplier-list.component').then((m) => m.SupplierListComponent),
      },
      {
        path: 'orders',
        canActivate: [authGuard, cashierGuard],
        loadComponent: () => import('../orders/order-list/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'shifts',
        canActivate: [authGuard, cashierGuard],
        loadComponent: () => import('../shifts/shift-list/shift-list.component').then((m) => m.ShiftListComponent),
      },
      {
        path: 'reports',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../reports/reports-page/reports-page.component').then((m) => m.ReportsPageComponent),
      },
      {
        path: 'settings',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../settings/settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'users',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../users/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'branches',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../branches/branch-list/branch-list.component').then((m) => m.BranchListComponent),
      },
      {
        path: 'tables',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../tables/table-list/table-list.component').then((m) => m.TableListComponent),
      },
      {
        path: 'taxes',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../taxes/tax-list/tax-list.component').then((m) => m.TaxListComponent),
      },
      {
        path: 'discounts',
        canActivate: [authGuard, managerGuard],
        loadComponent: () => import('../discounts/discount-list/discount-list.component').then((m) => m.DiscountListComponent),
      },
      {
        path: 'kitchen',
        canActivate: [authGuard, cashierGuard],
        loadComponent: () => import('../kitchen/kitchen-display/kitchen-display.component').then((m) => m.KitchenDisplayComponent),
      },
    ],
  },
];
