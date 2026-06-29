import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { ProductService } from '../../../core/services/product.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PurchaseOrder, PurchaseOrderRequest, PurchaseOrderStatus } from '../../../core/models/purchase-order.model';
import { Product } from '../../../core/models/product.model';
import { Supplier } from '../../../core/models/supplier.model';
import { DateFieldComponent } from '../../../shared/components/date-field/date-field.component';

export interface PurchaseOrderDialogData {
  po?: PurchaseOrder;
  branchId: number;
}

@Component({
  selector: 'app-purchase-order-dialog',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule, TranslateModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, DateFieldComponent,
  ],
  templateUrl: './purchase-order-dialog.component.html',
})
export class PurchaseOrderDialogComponent implements OnInit {
  products: Product[] = [];
  suppliers: Supplier[] = [];
  saving = false;

  readonly form = this.fb.nonNullable.group({
    supplierId: [null as number | null],
    status: ['DRAFT' as PurchaseOrderStatus],
    orderDate: [new Date().toISOString().slice(0, 10)],
    expectedDate: [''],
    invoiceNo: [''],
    notes: [''],
    items: this.fb.array([this.newItemRow()]),
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly poService: PurchaseOrderService,
    private readonly productService: ProductService,
    private readonly supplierService: SupplierService,
    private readonly snack: SnackService,
    readonly i18n: I18nService,
    readonly ref: MatDialogRef<PurchaseOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: PurchaseOrderDialogData
  ) {}

  ngOnInit(): void {
    this.productService.list(0, 500).subscribe({ next: (p) => (this.products = p.content) });
    this.supplierService.list(0, 100).subscribe({ next: (p) => (this.suppliers = p.content) });
    if (this.data.po) {
      const po = this.data.po;
      this.form.patchValue({
        supplierId: po.supplierId ?? null,
        status: po.status,
        orderDate: po.orderDate ?? '',
        expectedDate: po.expectedDate ?? '',
        invoiceNo: po.invoiceNo ?? '',
        notes: po.notes ?? '',
      });
      this.items.clear();
      po.items.forEach((item) => {
        this.items.push(this.fb.nonNullable.group({
          productId: [item.productId, Validators.required],
          quantity: [Number(item.quantity), [Validators.required, Validators.min(0.001)]],
          unitCost: [Number(item.unitCost), [Validators.required, Validators.min(0)]],
        }));
      });
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get isEdit(): boolean {
    return !!this.data.po;
  }

  newItemRow() {
    return this.fb.nonNullable.group({
      productId: [null as number | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.001)]],
      unitCost: [0, [Validators.required, Validators.min(0)]],
    });
  }

  addItem(): void {
    this.items.push(this.newItemRow());
  }

  removeItem(i: number): void {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body: PurchaseOrderRequest = {
      supplierId: v.supplierId ?? undefined,
      status: v.status,
      orderDate: v.orderDate || undefined,
      expectedDate: v.expectedDate || undefined,
      invoiceNo: v.invoiceNo || undefined,
      notes: v.notes || undefined,
      items: v.items.map((i) => ({
        productId: i.productId!,
        quantity: Number(i.quantity),
        unitCost: Number(i.unitCost),
      })),
    };
    this.saving = true;
    const req$ = this.data.po
      ? this.poService.update(this.data.po.id, body)
      : this.poService.create(this.data.branchId, body);
    req$.subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('COMMON.SAVED'));
        this.ref.close(true);
      },
      error: (e: Error) => {
        this.saving = false;
        this.snack.errorFrom(e);
      },
    });
  }
}
