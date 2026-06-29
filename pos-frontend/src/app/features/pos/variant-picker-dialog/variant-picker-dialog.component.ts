import { Component, Inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ProductVariant } from '../../../core/models/product-variant.model';

export interface VariantPickerData {
  productName: string;
  variants: ProductVariant[];
}

@Component({
  selector: 'app-variant-picker-dialog',
  standalone: true,
  imports: [NgFor, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'POS.SELECT_VARIANT' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ data.productName }}</p>
      <button mat-stroked-button type="button" class="variant-btn" *ngFor="let v of data.variants" (click)="pick(v)">
        {{ v.name }} — {{ v.sellingPrice }}
      </button>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.variant-btn { display: block; width: 100%; margin: 8px 0; min-height: 48px; }`],
})
export class VariantPickerDialogComponent {
  constructor(
    readonly ref: MatDialogRef<VariantPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: VariantPickerData
  ) {}

  pick(variant: ProductVariant): void {
    this.ref.close(variant);
  }
}
