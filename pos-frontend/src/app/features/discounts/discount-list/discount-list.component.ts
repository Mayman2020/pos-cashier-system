import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { DiscountService } from '../../../core/services/discount.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Discount } from '../../../core/models/discount.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DiscountDialogComponent } from '../discount-dialog/discount-dialog.component';

@Component({
  selector: 'app-discount-list',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, MatButtonModule, PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent],
  templateUrl: './discount-list.component.html',
})
export class DiscountListComponent implements OnInit {
  loading = true;
  discounts: Discount[] = [];

  constructor(
    private readonly discountService: DiscountService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.discountService.list().subscribe({
      next: (rows) => {
        this.discounts = rows;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  typeLabel(type: string): string {
    return this.i18n.instant(`DISCOUNTS.${type}`);
  }

  openDialog(discount?: Discount): void {
    this.dialog
      .open(DiscountDialogComponent, { width: '480px', panelClass: 'app-dialog-panel', data: discount ?? null })
      .afterClosed()
      .subscribe((body) => {
        if (!body) return;
        const req$ = discount ? this.discountService.update(discount.id, body) : this.discountService.create(body);
        req$.subscribe({
          next: () => {
            this.snack.success(this.i18n.instant('COMMON.SAVED'));
            this.load();
          },
          error: (e: Error) => this.snack.error(e.message),
        });
      });
  }
}
