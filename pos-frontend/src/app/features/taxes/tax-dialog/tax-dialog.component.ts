import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { Tax, TaxRequest } from '../../../core/models/tax.model';

@Component({
  selector: 'app-tax-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ (data ? 'TAXES.EDIT' : 'TAXES.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'TAXES.CODE' | translate }}</mat-label><input matInput formControlName="code" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'TAXES.NAME' | translate }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'TAXES.RATE' | translate }}</mat-label><input matInput type="number" step="0.01" formControlName="rate" /></mat-form-field>
      <mat-checkbox formControlName="defaultTax">{{ 'TAXES.DEFAULT' | translate }}</mat-checkbox>
      <mat-checkbox formControlName="active">{{ 'COMMON.ACTIVE' | translate }}</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="save()">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; } mat-checkbox { display: block; margin: 8px 0; }`],
})
export class TaxDialogComponent implements OnInit {
  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    rate: [0, [Validators.required, Validators.min(0)]],
    defaultTax: [false],
    active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    readonly ref: MatDialogRef<TaxDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: Tax | null
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        code: this.data.code,
        name: this.data.name,
        rate: this.data.rate,
        defaultTax: !!this.data.defaultTax,
        active: this.data.active !== false,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue() as TaxRequest);
  }
}
