import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { Branch, BranchRequest } from '../../../core/models/branch.model';

@Component({
  selector: 'app-branch-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ (data ? 'BRANCHES.EDIT' : 'BRANCHES.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'BRANCHES.CODE' | translate }}</mat-label><input matInput formControlName="code" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'BRANCHES.NAME' | translate }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'BRANCHES.ADDRESS' | translate }}</mat-label><input matInput formControlName="address" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CUSTOMERS.PHONE' | translate }}</mat-label><input matInput formControlName="phone" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CUSTOMERS.EMAIL' | translate }}</mat-label><input matInput formControlName="email" /></mat-form-field>
      <mat-checkbox formControlName="active">{{ 'COMMON.ACTIVE' | translate }}</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="ref.close(form.getRawValue())">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class BranchDialogComponent implements OnInit {
  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    address: [''],
    phone: [''],
    email: [''],
    active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    readonly ref: MatDialogRef<BranchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: Branch | null
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        code: this.data.code,
        name: this.data.name,
        address: this.data.address ?? '',
        phone: this.data.phone ?? '',
        email: this.data.email ?? '',
        active: this.data.active !== false,
      });
    }
  }
}
