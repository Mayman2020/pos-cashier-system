import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

interface NavItem {
  icon: string;
  labelKey: string;
  route: string;
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
    { icon: 'point_of_sale', labelKey: 'NAV.POS', route: '/admin/pos', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'dashboard', labelKey: 'NAV.DASHBOARD', route: '/admin/dashboard', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'inventory_2', labelKey: 'NAV.PRODUCTS', route: '/admin/products', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'category', labelKey: 'NAV.CATEGORIES', route: '/admin/categories', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'percent', labelKey: 'NAV.TAXES', route: '/admin/taxes', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'sell', labelKey: 'NAV.DISCOUNTS', route: '/admin/discounts', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'restaurant', labelKey: 'NAV.KITCHEN', route: '/admin/kitchen', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'warehouse', labelKey: 'NAV.INVENTORY', route: '/admin/inventory', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'groups', labelKey: 'NAV.CUSTOMERS', route: '/admin/customers', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'local_shipping', labelKey: 'NAV.SUPPLIERS', route: '/admin/suppliers', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'receipt_long', labelKey: 'NAV.ORDERS', route: '/admin/orders', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'schedule', labelKey: 'NAV.SHIFTS', route: '/admin/shifts', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'bar_chart', labelKey: 'NAV.REPORTS', route: '/admin/reports', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'table_restaurant', labelKey: 'NAV.TABLES', route: '/admin/tables', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'store', labelKey: 'NAV.BRANCHES', route: '/admin/branches', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'manage_accounts', labelKey: 'NAV.USERS', route: '/admin/users', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'settings', labelKey: 'NAV.SETTINGS', route: '/admin/settings', roles: ['ADMIN', 'MANAGER'] },
  ];

  constructor(readonly auth: AuthService) {}

  get visibleItems(): NavItem[] {
    const role = this.auth.getRole();
    if (!role) return [];
    return this.navItems.filter((item) => item.roles.includes(role));
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
}
