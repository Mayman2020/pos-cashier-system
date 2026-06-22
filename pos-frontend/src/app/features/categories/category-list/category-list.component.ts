import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '../../../core/services/category.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Category } from '../../../core/models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule, MatButtonModule,
    PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent implements OnInit {
  loading = true;
  categories: Category[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  search = '';

  constructor(
    private readonly categoryService: CategoryService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.list(this.pageIndex, this.pageSize, this.search || undefined).subscribe({
      next: (page) => {
        this.categories = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openDialog(category?: Category): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '480px',
      panelClass: 'app-dialog-panel',
      data: category ?? null,
    });
    ref.afterClosed().subscribe((body) => {
      if (!body) return;
      const req$ = category ? this.categoryService.update(category.id, body) : this.categoryService.create(body);
      req$.subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.SAVED'));
          this.load();
        },
        error: (e: Error) => this.snack.error(e.message),
      });
    });
  }

  deleteCategory(category: Category): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog-panel',
      data: { title: 'COMMON.DELETE', message: 'CATEGORIES.DELETE_MSG', danger: true },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.categoryService.delete(category.id).subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.DELETED'));
          this.load();
        },
        error: (e: Error) => this.snack.error(e.message),
      });
    });
  }
}
