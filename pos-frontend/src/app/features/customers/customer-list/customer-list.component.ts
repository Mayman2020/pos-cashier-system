import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerService } from '../../../core/services/customer.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Customer } from '../../../core/models/customer.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CustomerDialogComponent } from '../customer-dialog/customer-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, MatButtonModule, PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  loading = true;
  customers: Customer[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;

  constructor(
    private readonly customerService: CustomerService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.customerService.list(this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.customers = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(customer?: Customer): void {
    const ref = this.dialog.open(CustomerDialogComponent, { width: '480px', panelClass: 'app-dialog-panel', data: customer ?? null });
    ref.afterClosed().subscribe((body) => {
      if (!body) return;
      const req$ = customer ? this.customerService.update(customer.id, body) : this.customerService.create(body);
      req$.subscribe({ next: () => { this.snack.success(this.i18n.instant('COMMON.SAVED')); this.load(); }, error: (e: Error) => this.snack.error(e.message) });
    });
  }

  deleteCustomer(customer: Customer): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { panelClass: 'app-dialog-panel', data: { title: 'COMMON.DELETE', message: 'CUSTOMERS.DELETE_MSG', danger: true } });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.customerService.delete(customer.id).subscribe({ next: () => { this.snack.success(this.i18n.instant('COMMON.DELETED')); this.load(); }, error: (e: Error) => this.snack.error(e.message) });
    });
  }
}
