import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { BranchService } from '../../../core/services/branch.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { InventoryBalance, StockMovement } from '../../../core/models/inventory.model';
import { Product } from '../../../core/models/product.model';
import { Branch } from '../../../core/models/branch.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule, TranslateModule,
    MatButtonModule, MatTabsModule, MatFormFieldModule, MatInputModule,
    PageHeaderComponent, TablePagerComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.scss',
})
export class InventoryPageComponent implements OnInit {
  loading = true;
  balances: InventoryBalance[] = [];
  lowStock: InventoryBalance[] = [];
  movements: StockMovement[] = [];
  products: Product[] = [];
  branches: Branch[] = [];
  total = 0;
  movTotal = 0;
  pageIndex = 0;
  movPageIndex = 0;
  pageSize = 10;

  readonly stockInForm = this.fb.nonNullable.group({
    productId: [null as number | null],
    quantity: [1],
    notes: [''],
  });

  readonly adjustForm = this.fb.nonNullable.group({
    productId: [null as number | null],
    quantity: [0],
    notes: [''],
  });

  readonly transferForm = this.fb.nonNullable.group({
    productId: [null as number | null],
    toBranchId: [null as number | null],
    quantity: [1],
    notes: [''],
  });

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly productService: ProductService,
    private readonly branchService: BranchService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.productService.list(0, 500).subscribe({ next: (p) => (this.products = p.content) });
    this.branchService.list(0, 100).subscribe({
      next: (page) => {
        this.branches = page.content.filter((b) => b.id !== this.branchId);
        const first = this.branches[0];
        if (first) {
          this.transferForm.patchValue({ toBranchId: first.id });
        }
      },
    });
    this.loadBalances();
    this.loadLowStock();
    this.loadMovements();
  }

  movementTypeLabel(type?: string): string {
    if (!type) return this.i18n.instant('COMMON.NONE');
    const key = `INVENTORY.MOVEMENT_${type}`;
    const translated = this.i18n.instant(key);
    return translated !== key ? translated : type;
  }

  get transferBranches(): Branch[] {
    return this.branches.filter((b) => b.id !== this.branchId);
  }

  get branchId(): number {
    return this.auth.getCurrentUser()?.branchId ?? 1;
  }

  get canManageStock(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  loadBalances(): void {
    this.loading = true;
    this.inventoryService.balances(this.pageIndex, this.pageSize, this.branchId).subscribe({
      next: (page) => {
        this.balances = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadLowStock(): void {
    this.inventoryService.lowStock(this.branchId).subscribe({ next: (rows) => (this.lowStock = rows) });
  }

  loadMovements(): void {
    this.inventoryService.movements(this.movPageIndex, this.pageSize, this.branchId).subscribe({
      next: (page) => {
        this.movements = page.content;
        this.movTotal = page.totalElements;
      },
    });
  }

  submitStockIn(): void {
    const v = this.stockInForm.getRawValue();
    if (!v.productId) return;
    this.inventoryService
      .stockIn({ branchId: this.branchId, productId: v.productId, quantity: v.quantity, notes: v.notes })
      .subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.SAVED'));
          this.stockInForm.reset({ productId: null, quantity: 1, notes: '' });
          this.loadBalances();
          this.loadLowStock();
          this.loadMovements();
        },
        error: (e: Error) => this.snack.errorFrom(e),
      });
  }

  submitAdjust(): void {
    const v = this.adjustForm.getRawValue();
    if (!v.productId) return;
    this.inventoryService
      .adjust({ branchId: this.branchId, productId: v.productId, quantity: v.quantity, notes: v.notes })
      .subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.SAVED'));
          this.adjustForm.reset({ productId: null, quantity: 0, notes: '' });
          this.loadBalances();
          this.loadLowStock();
          this.loadMovements();
        },
        error: (e: Error) => this.snack.errorFrom(e),
      });
  }

  submitTransfer(): void {
    const v = this.transferForm.getRawValue();
    if (!v.productId || !v.toBranchId) return;
    this.inventoryService
      .transfer({
        fromBranchId: this.branchId,
        toBranchId: v.toBranchId,
        productId: v.productId,
        quantity: v.quantity,
        notes: v.notes,
      })
      .subscribe({
        next: () => {
          this.snack.success(this.i18n.instant('COMMON.SAVED'));
          this.transferForm.reset({ productId: null, toBranchId: this.transferBranches[0]?.id ?? null, quantity: 1, notes: '' });
          this.loadBalances();
          this.loadMovements();
        },
        error: (e: Error) => this.snack.errorFrom(e),
      });
  }
}
