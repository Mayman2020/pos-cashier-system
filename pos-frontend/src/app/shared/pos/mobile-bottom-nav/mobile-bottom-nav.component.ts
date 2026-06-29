import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

interface NavItem {
  icon: string;
  labelKey: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-pos-mobile-bottom-nav',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './mobile-bottom-nav.component.html',
  styleUrl: './mobile-bottom-nav.component.scss',
})
export class PosMobileBottomNavComponent {
  private readonly allItems: NavItem[] = [
    { icon: 'home', labelKey: 'NAV.DASHBOARD', route: '/admin/dashboard', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'inventory_2', labelKey: 'NAV.PRODUCTS', route: '/admin/products', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'point_of_sale', labelKey: 'NAV.POS', route: '/admin/pos', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { icon: 'bar_chart', labelKey: 'NAV.REPORTS', route: '/admin/reports', roles: ['ADMIN', 'MANAGER'] },
    { icon: 'settings', labelKey: 'NAV.SETTINGS', route: '/admin/settings', roles: ['ADMIN', 'MANAGER'] },
  ];

  constructor(private readonly auth: AuthService) {}

  get items(): NavItem[] {
    const role = this.auth.getRole();
    if (!role) return [];
    return this.allItems.filter((i) => i.roles.includes(role));
  }
}
