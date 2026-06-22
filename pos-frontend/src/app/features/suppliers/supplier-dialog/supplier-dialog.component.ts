import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { Supplier } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ (data ? 'SUPPLIERS.EDIT' : 'SUPPLIERS.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'SUPPLIERS.NAME' | translate }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'SUPPLIERS.PHONE' | translate }}</mat-label><input matInput formControlName="phone" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'SUPPLIERS.EMAIL' | translate }}</mat-label><input matInput formControlName="email" /></mat-form-field>
      <mat-checkbox formControlName="active">{{ 'COMMON.ACTIVE' | translate }}</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="ref.close(form.getRawValue())">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class SupplierDialogComponent implements OnInit {
  readonly form = this.fb.nonNullable.group({ name: ['', Validators.required], phone: [''], email: [''], contactPerson: [''], active: [true] });
  constructor(private readonly fb: FormBuilder, readonly ref: MatDialogRef<SupplierDialogComponent>, @Inject(MAT_DIALOG_DATA) readonly data: Supplier | null) {}
  ngOnInit(): void {
    if (this.data) this.form.patchValue({ name: this.data.name, phone: this.data.phone ?? '', email: this.data.email ?? '', contactPerson: this.data.contactPerson ?? '', active: this.data.active !== false });
  }
}
