import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { SupplierService } from '../../../core/services/supplier.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Supplier } from '../../../core/models/supplier.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SupplierDialogComponent } from '../supplier-dialog/supplier-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, MatButtonModule, PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './supplier-list.component.html',
})
export class SupplierListComponent implements OnInit {
  loading = true;
  suppliers: Supplier[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  constructor(private readonly supplierService: SupplierService, private readonly dialog: MatDialog, private readonly snack: SnackService, readonly i18n: I18nService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.supplierService.list(this.pageIndex, this.pageSize).subscribe({ next: (page) => { this.suppliers = page.content; this.total = page.totalElements; this.loading = false; }, error: () => (this.loading = false) });
  }
  openDialog(supplier?: Supplier): void {
    const ref = this.dialog.open(SupplierDialogComponent, { width: '480px', panelClass: 'app-dialog-panel', data: supplier ?? null });
    ref.afterClosed().subscribe((body) => {
      if (!body) return;
      const req$ = supplier ? this.supplierService.update(supplier.id, body) : this.supplierService.create(body);
      req$.subscribe({ next: () => { this.snack.success(this.i18n.instant('COMMON.SAVED')); this.load(); }, error: (e: Error) => this.snack.error(e.message) });
    });
  }
  deleteSupplier(supplier: Supplier): void {
    const ref = this.dialog.open(ConfirmDialogComponent, { panelClass: 'app-dialog-panel', data: { title: 'COMMON.DELETE', message: 'SUPPLIERS.DELETE_MSG', danger: true } });
    ref.afterClosed().subscribe((ok) => { if (!ok) return; this.supplierService.delete(supplier.id).subscribe({ next: () => { this.snack.success(this.i18n.instant('COMMON.DELETED')); this.load(); }, error: (e: Error) => this.snack.error(e.message) }); });
  }
}
