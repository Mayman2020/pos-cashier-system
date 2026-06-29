import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { PermissionService } from '../../core/services/permission.service';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';

interface NavItem {
  icon: string;
  tone: 'purple' | 'orange' | 'cyan' | 'rose' | 'green' | 'gold' | 'indigo' | 'teal' | 'slate';
  labelKey: string;
  route: string;
  permissionKey: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, RouterLink, RouterLinkActive, MatTooltipModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() lang: 'ar' | 'en' = 'ar';
  @Output() collapseToggle = new EventEmitter<void>();

  readonly navItems: NavItem[] = [
    { icon: 'point_of_sale', tone: 'gold', labelKey: 'NAV.POS', route: '/admin/pos', permissionKey: 'pos', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'dashboard', tone: 'purple', labelKey: 'NAV.DASHBOARD', route: '/admin/dashboard', permissionKey: 'dashboard', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'inventory_2', tone: 'cyan', labelKey: 'NAV.PRODUCTS', route: '/admin/products', permissionKey: 'products', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'category', tone: 'indigo', labelKey: 'NAV.CATEGORIES', route: '/admin/categories', permissionKey: 'categories', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'straighten', tone: 'teal', labelKey: 'NAV.UNITS', route: '/admin/units', permissionKey: 'units', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'percent', tone: 'orange', labelKey: 'NAV.TAXES', route: '/admin/taxes', permissionKey: 'taxes', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'sell', tone: 'rose', labelKey: 'NAV.DISCOUNTS', route: '/admin/discounts', permissionKey: 'discounts', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'restaurant', tone: 'green', labelKey: 'NAV.KITCHEN', route: '/admin/kitchen', permissionKey: 'kitchen', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'warehouse', tone: 'slate', labelKey: 'NAV.INVENTORY', route: '/admin/inventory', permissionKey: 'inventory', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'groups', tone: 'cyan', labelKey: 'NAV.CUSTOMERS', route: '/admin/customers', permissionKey: 'customers', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'local_shipping', tone: 'orange', labelKey: 'NAV.SUPPLIERS', route: '/admin/suppliers', permissionKey: 'suppliers', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'shopping_cart', tone: 'purple', labelKey: 'NAV.PURCHASE_ORDERS', route: '/admin/purchase-orders', permissionKey: 'purchase_orders', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'receipt_long', tone: 'gold', labelKey: 'NAV.ORDERS', route: '/admin/orders', permissionKey: 'orders', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'schedule', tone: 'teal', labelKey: 'NAV.SHIFTS', route: '/admin/shifts', permissionKey: 'shifts', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'bar_chart', tone: 'indigo', labelKey: 'NAV.REPORTS', route: '/admin/reports', permissionKey: 'reports', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'payments', tone: 'rose', labelKey: 'NAV.EXPENSES', route: '/admin/expenses', permissionKey: 'expenses', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'history', tone: 'slate', labelKey: 'NAV.AUDIT', route: '/admin/audit-logs', permissionKey: 'audit', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'table_restaurant', tone: 'green', labelKey: 'NAV.TABLES', route: '/admin/tables', permissionKey: 'tables', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'store', tone: 'orange', labelKey: 'NAV.BRANCHES', route: '/admin/branches', permissionKey: 'branches', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'manage_accounts', tone: 'cyan', labelKey: 'NAV.USERS', route: '/admin/users', permissionKey: 'users', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'admin_panel_settings', tone: 'purple', labelKey: 'NAV.PERMISSIONS', route: '/admin/permissions', permissionKey: 'settings', roles: ['ADMIN'] },
    { icon: 'list_alt', tone: 'teal', labelKey: 'NAV.LOOKUPS', route: '/admin/lookups', permissionKey: 'settings', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'settings', tone: 'slate', labelKey: 'NAV.SETTINGS', route: '/admin/settings', permissionKey: 'settings', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'account_circle', tone: 'gold', labelKey: 'NAV.PROFILE', route: '/admin/profile', permissionKey: 'profile', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  ];

  constructor(
    readonly auth: AuthService,
    private readonly perms: PermissionService,
    private readonly navHistory: NavigationHistoryService
  ) {}

  get visibleItems(): NavItem[] {
    const role = this.auth.getRole();
    if (!role) return [];
    return this.navItems.filter((item) => item.roles.includes(role) && this.perms.can(item.permissionKey, 'view'));
  }

  get currentUserDisplayName(): string {
    const u = this.auth.getCurrentUser();
    return u?.fullName || u?.username || '';
  }

  get roleKey(): string {
    const role = this.auth.getRole();
    return role ? `ROLE.${role}` : '';
  }

  logout(): void {
    this.auth.logout();
  }

  onMenuNav(): void {
    this.navHistory.markFromMenu();
  }
}
