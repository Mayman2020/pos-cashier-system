import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductRequest } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

export interface ProductDialogData {
  product?: Product;
  categories: Category[];
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule, TranslateModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ (data.product ? 'PRODUCTS.EDIT' : 'PRODUCTS.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'PRODUCTS.SKU' | translate }}</mat-label><input matInput formControlName="sku" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'PRODUCTS.BARCODE' | translate }}</mat-label><input matInput formControlName="barcode" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'PRODUCTS.NAME' | translate }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>{{ 'PRODUCTS.CATEGORY' | translate }}</mat-label>
        <mat-select formControlName="categoryId">
          <mat-option *ngFor="let c of data.categories" [value]="c.id">{{ c.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'PRODUCTS.COST' | translate }}</mat-label><input matInput type="number" formControlName="costPrice" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'PRODUCTS.PRICE' | translate }}</mat-label><input matInput type="number" formControlName="sellingPrice" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'PRODUCTS.TAX_RATE' | translate }}</mat-label><input matInput type="number" formControlName="taxRate" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'INVENTORY.THRESHOLD' | translate }}</mat-label><input matInput type="number" formControlName="lowStockThreshold" /></mat-form-field>
      <mat-checkbox formControlName="active">{{ 'COMMON.ACTIVE' | translate }}</mat-checkbox>
      <mat-checkbox formControlName="trackStock">{{ 'PRODUCTS.TRACK_STOCK' | translate }}</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="save()">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class ProductDialogComponent implements OnInit {
  readonly form = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    barcode: [''],
    name: ['', Validators.required],
    categoryId: [null as number | null],
    costPrice: [0, Validators.required],
    sellingPrice: [0, Validators.required],
    taxRate: [0],
    lowStockThreshold: [5],
    active: [true],
    trackStock: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    readonly ref: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: ProductDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.product) {
      const p = this.data.product;
      this.form.patchValue({
        sku: p.sku,
        barcode: p.barcode ?? '',
        name: p.name,
        categoryId: p.categoryId ?? null,
        costPrice: Number(p.costPrice),
        sellingPrice: Number(p.sellingPrice),
        taxRate: Number(p.taxRate ?? 0),
        lowStockThreshold: Number(p.lowStockThreshold ?? 5),
        active: p.active !== false,
        trackStock: p.trackStock !== false,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body: ProductRequest = {
      sku: v.sku,
      barcode: v.barcode || undefined,
      name: v.name,
      categoryId: v.categoryId ?? undefined,
      costPrice: v.costPrice,
      sellingPrice: v.sellingPrice,
      taxRate: v.taxRate,
      lowStockThreshold: v.lowStockThreshold,
      active: v.active,
      trackStock: v.trackStock,
    };
    this.ref.close(body);
  }
}
