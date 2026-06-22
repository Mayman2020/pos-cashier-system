import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule, MatButtonModule,
    PageHeaderComponent, TablePagerComponent, EmptyStateComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  loading = true;
  products: Product[] = [];
  categories: Category[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  search = '';

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.categoryService.list(0, 200).subscribe({ next: (p) => (this.categories = p.content) });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.productService.list(this.pageIndex, this.pageSize, this.search || undefined).subscribe({
      next: (page) => {
        this.products = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onPageChange(index: number): void {
    this.pageIndex = index;
    this.load();
  }

  openDialog(product?: Product): void {
    const ref = this.dialog.open(ProductDialogComponent, {
      width: '520px',
      panelClass: 'app-dialog-panel',
      data: { product, categories: this.categories },
    });
    ref.afterClosed().subscribe((body) => {
      if (!body) return;
      const req$ = product
        ? this.productService.update(product.id, body)
        : this.productService.create(body);
      req$.subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.SAVED'));
          this.load();
        },
        error: (e: Error) => this.snack.error(e.message),
      });
    });
  }

  deleteProduct(product: Product): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog-panel',
      data: { title: 'COMMON.DELETE', message: 'PRODUCTS.DELETE_MSG', danger: true },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.productService.delete(product.id).subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.DELETED'));
          this.load();
        },
        error: (e: Error) => this.snack.error(e.message),
      });
    });
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }

  readonly Number = Number;
}
