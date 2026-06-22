import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { Discount, DiscountRequest, DiscountType } from '../../../core/models/discount.model';

@Component({
  selector: 'app-discount-dialog',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ (data ? 'DISCOUNTS.EDIT' : 'DISCOUNTS.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'DISCOUNTS.CODE' | translate }}</mat-label><input matInput formControlName="code" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'DISCOUNTS.NAME' | translate }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>{{ 'DISCOUNTS.TYPE' | translate }}</mat-label>
        <mat-select formControlName="discountType">
          <mat-option value="PERCENT">{{ 'DISCOUNTS.PERCENT' | translate }}</mat-option>
          <mat-option value="FIXED">{{ 'DISCOUNTS.FIXED' | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'DISCOUNTS.VALUE' | translate }}</mat-label><input matInput type="number" step="0.01" formControlName="value" /></mat-form-field>
      <mat-checkbox formControlName="active">{{ 'COMMON.ACTIVE' | translate }}</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="save()">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class DiscountDialogComponent implements OnInit {
  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    discountType: ['PERCENT' as DiscountType, Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
    active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    readonly ref: MatDialogRef<DiscountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: Discount | null
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        code: this.data.code,
        name: this.data.name,
        discountType: this.data.discountType,
        value: this.data.value,
        active: this.data.active !== false,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue() as DiscountRequest);
  }
}
