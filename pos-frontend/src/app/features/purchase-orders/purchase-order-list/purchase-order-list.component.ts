import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PurchaseOrder } from '../../../core/models/purchase-order.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PurchaseOrderDialogComponent } from '../purchase-order-dialog/purchase-order-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    NgIf, NgFor, TranslateModule, MatButtonModule, MatDialogModule, RmsDatePipe,
    PageHeaderComponent, TablePagerComponent, LoadingSpinnerComponent, EmptyStateComponent,
  ],
  templateUrl: './purchase-order-list.component.html',
})
export class PurchaseOrderListComponent implements OnInit, OnDestroy {
  loading = true;
  orders: PurchaseOrder[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  private branchSub?: Subscription;

  constructor(
    private readonly poService: PurchaseOrderService,
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
    this.poService.list(this.pageIndex, this.pageSize, this.branchId).subscribe({
      next: (page) => {
        this.orders = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(po?: PurchaseOrder): void {
    const ref = this.dialog.open(PurchaseOrderDialogComponent, {
      width: '720px',
      panelClass: 'app-dialog-panel',
      data: { po, branchId: this.branchId },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.load();
    });
  }

  receive(po: PurchaseOrder): void {
    this.poService.receive(po.id).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('PO.RECEIVED_MSG'));
        this.load();
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  cancel(po: PurchaseOrder): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog-panel',
      data: { title: 'PO.CANCEL_TITLE', message: 'PO.CANCEL_MSG', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.poService.cancel(po.id).subscribe({
        next: () => { this.snack.success(this.i18n.instant('COMMON.SAVED')); this.load(); },
        error: (e: Error) => this.snack.errorFrom(e),
      });
    });
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }

  readonly Number = Number;
}
