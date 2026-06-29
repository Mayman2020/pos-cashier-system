import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { USER_ROLE_VALUES, ModulePermission, PermissionAction, UserRole } from '../../../core/models/user.model';
import { RolePermissionDto, RolePermissionService } from '../../../core/services/role-permission.service';
import { SnackService } from '../../../core/services/snack.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'NAV.DASHBOARD',
  pos: 'NAV.POS',
  products: 'NAV.PRODUCTS',
  categories: 'NAV.CATEGORIES',
  units: 'NAV.UNITS',
  taxes: 'NAV.TAXES',
  discounts: 'NAV.DISCOUNTS',
  kitchen: 'NAV.KITCHEN',
  inventory: 'NAV.INVENTORY',
  customers: 'NAV.CUSTOMERS',
  suppliers: 'NAV.SUPPLIERS',
  purchase_orders: 'NAV.PURCHASE_ORDERS',
  orders: 'NAV.ORDERS',
  shifts: 'NAV.SHIFTS',
  reports: 'NAV.REPORTS',
  expenses: 'NAV.EXPENSES',
  audit: 'NAV.AUDIT',
  tables: 'NAV.TABLES',
  branches: 'NAV.BRANCHES',
  users: 'NAV.USERS',
  settings: 'NAV.SETTINGS',
  profile: 'NAV.PROFILE',
};

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  templateUrl: './permissions-page.component.html',
  styleUrl: './permissions-page.component.scss',
})
export class PermissionsPageComponent implements OnInit {
  loading = true;
  saving = false;
  roles = USER_ROLE_VALUES.filter((role) => role !== 'ADMIN');
  selectedRole: UserRole = 'MANAGER';
  allRoles: RolePermissionDto[] = [];
  permissions: Record<string, ModulePermission> = {};
  modules: string[] = [];
  readonly actions = ACTIONS;

  constructor(
    private readonly rolePermissionService: RolePermissionService,
    private readonly snack: SnackService
  ) {}

  ngOnInit(): void {
    this.rolePermissionService.getAll().subscribe({
      next: (roles) => {
        this.allRoles = roles ?? [];
        this.applyRole(this.selectedRole);
        this.loading = false;
      },
      error: (error: Error) => {
        this.snack.error(error.message);
        this.loading = false;
      },
    });
  }

  onRoleChange(): void {
    this.applyRole(this.selectedRole);
  }

  moduleLabel(key: string): string {
    return MODULE_LABELS[key] ?? key;
  }

  isChecked(module: string, action: PermissionAction): boolean {
    return this.permissions[module]?.[action] === true;
  }

  toggle(module: string, action: PermissionAction, checked: boolean): void {
    if (!this.permissions[module]) this.permissions[module] = {};
    this.permissions[module][action] = checked;
  }

  save(): void {
    this.saving = true;
    this.rolePermissionService.update(this.selectedRole, this.permissions).subscribe({
      next: (updated) => {
        const roleIndex = this.allRoles.findIndex((role) => role.role === this.selectedRole);
        if (roleIndex >= 0 && updated) this.allRoles[roleIndex] = updated;
        this.snack.success('Saved');
        this.saving = false;
      },
      error: (error: Error) => {
        this.snack.error(error.message);
        this.saving = false;
      },
    });
  }

  private applyRole(role: UserRole): void {
    const found = this.allRoles.find((item) => item.role === role);
    this.permissions = { ...(found?.permissions ?? {}) };
    this.modules = Object.keys(this.permissions).sort();
  }
}
