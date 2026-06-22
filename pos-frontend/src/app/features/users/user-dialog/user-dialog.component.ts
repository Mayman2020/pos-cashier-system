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
import { PosUser, UserRequest } from '../../../core/models/user-admin.model';
import { BranchService } from '../../../core/services/branch.service';
import { Branch } from '../../../core/models/branch.model';

export interface UserDialogData {
  user?: PosUser;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    NgFor, ReactiveFormsModule, TranslateModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ (data.user ? 'USERS.EDIT' : 'USERS.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'AUTH.USERNAME' | translate }}</mat-label><input matInput formControlName="username" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CUSTOMERS.EMAIL' | translate }}</mat-label><input matInput formControlName="email" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'USERS.PASSWORD' | translate }}</mat-label><input matInput type="password" formControlName="password" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CUSTOMERS.NAME' | translate }}</mat-label><input matInput formControlName="fullName" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CUSTOMERS.PHONE' | translate }}</mat-label><input matInput formControlName="phone" /></mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>{{ 'BRANCHES.TITLE' | translate }}</mat-label>
        <mat-select formControlName="branchId">
          <mat-option [value]="null">—</mat-option>
          <mat-option *ngFor="let b of branches" [value]="b.id">{{ b.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>{{ 'USERS.ROLES' | translate }}</mat-label>
        <mat-select formControlName="role" multiple>
          <mat-option value="ADMIN">{{ 'ROLE.ADMIN' | translate }}</mat-option>
          <mat-option value="MANAGER">{{ 'ROLE.MANAGER' | translate }}</mat-option>
          <mat-option value="CASHIER">{{ 'ROLE.CASHIER' | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-checkbox formControlName="active">{{ 'COMMON.ACTIVE' | translate }}</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="save()">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class UserDialogComponent implements OnInit {
  branches: Branch[] = [];
  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    fullName: [''],
    phone: [''],
    branchId: [null as number | null],
    role: [['CASHIER'] as string[], Validators.required],
    active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly branchService: BranchService,
    readonly ref: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: UserDialogData
  ) {}

  ngOnInit(): void {
    this.branchService.list(0, 100).subscribe({ next: (p) => (this.branches = p.content) });
    if (this.data.user) {
      const u = this.data.user;
      this.form.patchValue({
        username: u.username,
        email: u.email,
        fullName: u.fullName ?? '',
        phone: u.phone ?? '',
        branchId: u.branchId ?? null,
        role: u.roles?.length ? u.roles : ['CASHIER'],
        active: u.active,
      });
      this.form.controls.password.clearValidators();
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.form.controls.password.updateValueAndValidity();
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body: UserRequest = {
      username: v.username,
      email: v.email,
      fullName: v.fullName || undefined,
      phone: v.phone || undefined,
      branchId: v.branchId ?? undefined,
      roles: v.role,
      active: v.active,
    };
    if (v.password) body.password = v.password;
    this.ref.close(body);
  }
}
