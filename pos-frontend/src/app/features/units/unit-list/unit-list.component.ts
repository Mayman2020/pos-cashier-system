import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { UnitService } from '../../../core/services/unit.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Unit } from '../../../core/models/unit.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { UnitDialogComponent } from '../unit-dialog/unit-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-unit-list',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule, MatButtonModule,
    PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './unit-list.component.html',
})
export class UnitListComponent implements OnInit {
  loading = true;
  units: Unit[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  search = '';

  constructor(
    private readonly unitService: UnitService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.unitService.list(this.pageIndex, this.pageSize, this.search || undefined).subscribe({
      next: (page) => {
        this.units = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(unit?: Unit): void {
    const ref = this.dialog.open(UnitDialogComponent, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: unit ?? null,
    });
    ref.afterClosed().subscribe((body) => {
      if (!body) return;
      const req$ = unit ? this.unitService.update(unit.id, body) : this.unitService.create(body);
      req$.subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.SAVED'));
          this.load();
        },
        error: (e: Error) => this.snack.error(e.message),
      });
    });
  }

  deleteUnit(unit: Unit): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog-panel',
      data: { title: 'COMMON.DELETE', message: 'UNITS.DELETE_MSG', danger: true },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.unitService.delete(unit.id).subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.DELETED'));
          this.load();
        },
        error: (e: Error) => this.snack.error(e.message),
      });
    });
  }
}
