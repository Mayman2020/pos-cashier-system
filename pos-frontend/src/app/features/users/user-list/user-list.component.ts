import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { UserAdminService } from '../../../core/services/user-admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PosUser } from '../../../core/models/user-admin.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule, MatFormFieldModule, MatInputModule,
    PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  loading = true;
  users: PosUser[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  search = '';

  constructor(
    private readonly userService: UserAdminService,
    private readonly auth: AuthService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  load(): void {
    this.loading = true;
    this.userService.list(this.pageIndex, this.pageSize, this.search || undefined).subscribe({
      next: (page) => {
        this.users = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(user?: PosUser): void {
    if (!this.isAdmin) return;
    this.dialog
      .open(UserDialogComponent, { width: '520px', panelClass: 'app-dialog-panel', data: { user } })
      .afterClosed()
      .subscribe((body) => {
        if (!body) return;
        const req$ = user ? this.userService.update(user.id, body) : this.userService.create(body);
        req$.subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.SAVED'));
            this.load();
          },
          error: (e: Error) => this.snack.error(e.message),
        });
      });
  }

  deleteUser(user: PosUser): void {
    if (!this.isAdmin) return;
    this.dialog
      .open(ConfirmDialogComponent, { panelClass: 'app-dialog-panel', data: { title: 'COMMON.DELETE', message: 'USERS.DELETE_MSG', danger: true } })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.DELETED'));
            this.load();
          },
          error: (e: Error) => this.snack.error(e.message),
        });
      });
  }

  rolesLabel(user: PosUser): string {
    return (user.roles ?? []).map((r) => this.i18n.instant(`ROLE.${r}`)).join(', ');
  }

  get activeCount(): number {
    return this.users.filter((u) => u.active).length;
  }
}
