import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TaxService } from '../../../core/services/tax.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Tax } from '../../../core/models/tax.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TaxDialogComponent } from '../tax-dialog/tax-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tax-list',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, MatButtonModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './tax-list.component.html',
})
export class TaxListComponent implements OnInit {
  loading = true;
  taxes: Tax[] = [];

  constructor(
    private readonly taxService: TaxService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.taxService.list().subscribe({
      next: (rows) => {
        this.taxes = rows;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(tax?: Tax): void {
    this.dialog
      .open(TaxDialogComponent, { width: '480px', panelClass: 'app-dialog-panel', data: tax ?? null })
      .afterClosed()
      .subscribe((body) => {
        if (!body) return;
        const req$ = tax ? this.taxService.update(tax.id, body) : this.taxService.create(body);
        req$.subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.SAVED'));
            this.load();
          },
          error: (e: Error) => this.snack.error(e.message),
        });
      });
  }

  deleteTax(tax: Tax): void {
    this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog-panel',
      data: { title: 'COMMON.DELETE', message: 'TAXES.DELETE_MSG', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.taxService.delete(tax.id).subscribe({
        next: () => { this.snack.success(this.i18n.instant('COMMON.DELETED')); this.load(); },
        error: (e: Error) => this.snack.error(e.message),
      });
    });
  }
}
