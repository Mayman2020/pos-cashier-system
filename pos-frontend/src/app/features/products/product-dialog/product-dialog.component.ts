import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductRequest } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Unit } from '../../../core/models/unit.model';
import { Tax } from '../../../core/models/tax.model';
import { UnitService } from '../../../core/services/unit.service';
import { TaxService } from '../../../core/services/tax.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { ProductVariantService } from '../../../core/services/product-variant.service';
import { ModifierService } from '../../../core/services/modifier.service';
import { ProductVariant, ProductVariantRequest } from '../../../core/models/product-variant.model';
import { ProductModifier } from '../../../core/models/modifier.model';
import { ModifierRequest } from '../../../core/services/modifier.service';

export interface ProductDialogData {
  product?: Product;
  categories: Category[];
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule, TranslateModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatCheckboxModule, MatSelectModule, MatTabsModule,
  ],
  templateUrl: './product-dialog.component.html',
  styles: [`.full { width: 100%; display: block; } .tab-body { padding: 16px 0; } .img-preview { max-width: 120px; max-height: 120px; border-radius: 8px; margin-top: 8px; } .variant-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 8px; align-items: center; }`],
})
export class ProductDialogComponent implements OnInit {
  units: Unit[] = [];
  taxes: Tax[] = [];
  variants: ProductVariant[] = [];
  modifiers: ProductModifier[] = [];
  uploading = false;
  editingVariantId: number | null = null;
  editingModifierId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    barcode: [''],
    name: ['', Validators.required],
    description: [''],
    categoryId: [null as number | null],
    unitId: [null as number | null],
    taxId: [null as number | null],
    costPrice: [0, Validators.required],
    sellingPrice: [0, Validators.required],
    taxRate: [0],
    lowStockThreshold: [5],
    active: [true],
    trackStock: [true],
    imageUrl: [''],
  });

  readonly variantForm = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    barcode: [''],
    costPrice: [0, Validators.required],
    sellingPrice: [0, Validators.required],
  });

  readonly modifierForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    priceAdjustment: [0, Validators.required],
    modifierGroup: [''],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly unitService: UnitService,
    private readonly taxService: TaxService,
    private readonly fileUpload: FileUploadService,
    private readonly variantService: ProductVariantService,
    private readonly modifierService: ModifierService,
    readonly ref: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: ProductDialogData
  ) {}

  ngOnInit(): void {
    this.unitService.list(0, 100).subscribe({ next: (p) => (this.units = p.content) });
    this.taxService.list().subscribe({ next: (rows) => (this.taxes = rows) });
    if (this.data.product) {
      const p = this.data.product;
      this.form.patchValue({
        sku: p.sku,
        barcode: p.barcode ?? '',
        name: p.name,
        description: p.description ?? '',
        categoryId: p.categoryId ?? null,
        unitId: p.unitId ?? null,
        taxId: p.taxId ?? null,
        costPrice: Number(p.costPrice),
        sellingPrice: Number(p.sellingPrice),
        taxRate: Number(p.taxRate ?? 0),
        lowStockThreshold: Number(p.lowStockThreshold ?? 5),
        active: p.active !== false,
        trackStock: p.trackStock !== false,
        imageUrl: p.imageUrl ?? '',
      });
      this.loadVariants();
      this.loadModifiers();
    }
  }

  get isEdit(): boolean {
    return !!this.data.product;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.fileUpload.upload(file).subscribe({
      next: (res) => {
        this.form.patchValue({ imageUrl: res.url });
        this.uploading = false;
      },
      error: () => (this.uploading = false),
    });
  }

  addVariant(): void {
    if (!this.data.product || this.variantForm.invalid) return;
    const body = this.variantForm.getRawValue() as ProductVariantRequest;
    const req$ = this.editingVariantId != null
      ? this.variantService.update(this.data.product.id, this.editingVariantId, body)
      : this.variantService.create(this.data.product.id, body);
    req$.subscribe({
      next: () => {
        this.variantForm.reset({ costPrice: 0, sellingPrice: 0 });
        this.editingVariantId = null;
        this.loadVariants();
      },
    });
  }

  editVariant(v: ProductVariant): void {
    this.editingVariantId = v.id;
    this.variantForm.patchValue({
      sku: v.sku,
      name: v.name,
      barcode: v.barcode ?? '',
      costPrice: Number(v.costPrice),
      sellingPrice: Number(v.sellingPrice),
    });
  }

  deleteVariant(v: ProductVariant): void {
    if (!this.data.product) return;
    this.variantService.delete(this.data.product.id, v.id).subscribe({ next: () => this.loadVariants() });
  }

  addModifier(): void {
    if (!this.data.product || this.modifierForm.invalid) return;
    const body: ModifierRequest = {
      productId: this.data.product.id,
      ...this.modifierForm.getRawValue(),
    };
    const req$ = this.editingModifierId != null
      ? this.modifierService.update(this.editingModifierId, body)
      : this.modifierService.create(body);
    req$.subscribe({
      next: () => {
        this.modifierForm.reset({ priceAdjustment: 0 });
        this.editingModifierId = null;
        this.loadModifiers();
      },
    });
  }

  editModifier(m: ProductModifier): void {
    this.editingModifierId = m.id;
    this.modifierForm.patchValue({
      name: m.name,
      priceAdjustment: Number(m.priceAdjustment),
      modifierGroup: m.modifierGroup ?? '',
    });
  }

  deleteModifier(m: ProductModifier): void {
    this.modifierService.delete(m.id).subscribe({ next: () => this.loadModifiers() });
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body: ProductRequest = {
      sku: v.sku,
      barcode: v.barcode || undefined,
      name: v.name,
      description: v.description || undefined,
      categoryId: v.categoryId ?? undefined,
      unitId: v.unitId ?? undefined,
      taxId: v.taxId ?? undefined,
      costPrice: v.costPrice,
      sellingPrice: v.sellingPrice,
      taxRate: v.taxRate,
      lowStockThreshold: v.lowStockThreshold,
      active: v.active,
      trackStock: v.trackStock,
      imageUrl: v.imageUrl || undefined,
    };
    this.ref.close(body);
  }

  private loadVariants(): void {
    if (!this.data.product) return;
    this.variantService.list(this.data.product.id).subscribe({ next: (rows) => (this.variants = rows) });
  }

  private loadModifiers(): void {
    if (!this.data.product) return;
    this.modifierService.list(this.data.product.id).subscribe({ next: (rows) => (this.modifiers = rows) });
  }
}
