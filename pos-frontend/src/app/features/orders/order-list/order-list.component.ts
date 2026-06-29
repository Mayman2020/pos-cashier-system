import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { ReceiptService } from '../../../core/services/receipt.service';
import { AuthService } from '../../../core/services/auth.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PosOrder, OrderStatus } from '../../../core/models/order.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';
import { ReceiptDialogComponent } from '../../pos/receipt-dialog/receipt-dialog.component';
import { OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule, RmsDatePipe,
    MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit, OnDestroy {
  loading = true;
  orders: PosOrder[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  statusFilter: OrderStatus | '' = '';
  search = '';
  private branchSub?: Subscription;

  constructor(
    private readonly orderService: OrderService,
    private readonly receiptService: ReceiptService,
    private readonly auth: AuthService,
    private readonly branchContext: BranchContextService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.statusFilter = (params['status'] as OrderStatus) || '';
      this.load();
    });
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  get branchId(): number | undefined {
    return this.branchContext.getBranchId();
  }

  get canRefund(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  isRefundable(status: OrderStatus): boolean {
    return status === 'PAID' || status === 'PARTIALLY_REFUNDED';
  }

  resumeOrder(order: PosOrder): void {
    void this.router.navigate(['/admin/pos'], { queryParams: { resume: order.id } });
  }

  load(): void {
    this.loading = true;
    this.orderService
      .list(this.pageIndex, this.pageSize, this.branchId, this.statusFilter || undefined, this.search || undefined)
      .subscribe({
        next: (page) => {
          this.orders = page.content;
          this.total = page.totalElements;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  viewDetail(order: PosOrder): void {
    const ref = this.dialog.open(OrderDetailDialogComponent, {
      panelClass: 'app-dialog-panel',
      width: '640px',
      data: { orderId: order.id, canRefund: this.canRefund },
    });
    ref.afterClosed().subscribe((changed) => {
      if (changed) this.load();
    });
  }

  viewReceipt(order: PosOrder): void {
    this.receiptService.get(order.id).subscribe({
      next: (receipt) => {
        this.dialog.open(ReceiptDialogComponent, {
          panelClass: 'app-dialog-panel',
          width: '480px',
          data: receipt,
        });
      },
    });
  }

  cancelOrder(order: PosOrder): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        panelClass: 'app-dialog-panel',
        data: { title: 'POS.CANCEL_TITLE', message: 'POS.CANCEL_MSG', danger: true, confirmLabel: 'ACTIONS.CONFIRM' },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.orderService.cancel(order.id).subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('POS.CANCELLED'));
            this.load();
          },
          error: (e: Error) => this.snack.errorFrom(e),
        });
      });
  }

  refundOrder(order: PosOrder): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        panelClass: 'app-dialog-panel',
        data: { title: 'ORDERS.REFUND_TITLE', message: 'ORDERS.REFUND_MSG', danger: true, confirmLabel: 'ACTIONS.CONFIRM' },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.orderService.refund(order.id).subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.SAVED'));
            this.load();
          },
          error: (e: Error) => this.snack.errorFrom(e),
        });
      });
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }

  orderTypeLabel(type?: string): string {
    if (!type) return this.i18n.instant('COMMON.NONE');
    return this.i18n.instant(`POS.TYPE_${type}`);
  }

  get paidCount(): number {
    return this.orders.filter((order) => order.status === 'PAID').length;
  }

  get pendingCount(): number {
    return this.orders.filter((order) => order.status === 'PENDING').length;
  }

  readonly Number = Number;
}
