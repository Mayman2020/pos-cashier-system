import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TableService } from '../../../core/services/table.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { RestaurantTable } from '../../../core/models/table.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TableDialogComponent } from '../table-dialog/table-dialog.component';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, MatButtonModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './table-list.component.html',
})
export class TableListComponent implements OnInit, OnDestroy {
  loading = true;
  tables: RestaurantTable[] = [];
  private branchSub?: Subscription;

  constructor(
    private readonly tableService: TableService,
    private readonly branchContext: BranchContextService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  get branchId(): number {
    return this.branchContext.getBranchId();
  }

  load(): void {
    this.loading = true;
    this.tableService.list(this.branchId).subscribe({
      next: (rows) => {
        this.tables = rows;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(table?: RestaurantTable): void {
    this.dialog
      .open(TableDialogComponent, {
        width: '480px',
        panelClass: 'app-dialog-panel',
        data: { table, defaultBranchId: this.branchId },
      })
      .afterClosed()
      .subscribe((body) => {
        if (!body) return;
        const req$ = table ? this.tableService.update(table.id, body) : this.tableService.create(body);
        req$.subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.SAVED'));
            this.load();
          },
          error: (e: Error) => this.snack.error(e.message),
        });
      });
  }

  statusLabel(status: string): string {
    return this.i18n.instant(`TABLES.${status}`);
  }
}
