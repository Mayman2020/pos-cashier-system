import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { BranchService } from '../../../core/services/branch.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Branch } from '../../../core/models/branch.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BranchDialogComponent } from '../branch-dialog/branch-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './branch-list.component.html',
})
export class BranchListComponent implements OnInit {
  loading = true;
  branches: Branch[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  search = '';

  constructor(
    private readonly branchService: BranchService,
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
    this.branchService.list(this.pageIndex, this.pageSize, this.search || undefined).subscribe({
      next: (page) => {
        this.branches = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(branch?: Branch): void {
    this.dialog
      .open(BranchDialogComponent, { width: '520px', panelClass: 'app-dialog-panel', data: branch ?? null })
      .afterClosed()
      .subscribe((body) => {
        if (!body) return;
        const req$ = branch ? this.branchService.update(branch.id, body) : this.branchService.create(body);
        req$.subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.SAVED'));
            this.load();
          },
          error: (e: Error) => this.snack.error(e.message),
        });
      });
  }

  deleteBranch(branch: Branch): void {
    if (!this.isAdmin) return;
    this.dialog
      .open(ConfirmDialogComponent, { panelClass: 'app-dialog-panel', data: { title: 'COMMON.DELETE', message: 'BRANCHES.DELETE_MSG', danger: true } })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.branchService.delete(branch.id).subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.DELETED'));
            this.load();
          },
          error: (e: Error) => this.snack.error(e.message),
        });
      });
  }
}
