import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { RestaurantTable, TableStatus } from '../../../core/models/table.model';
import { BranchService } from '../../../core/services/branch.service';
import { Branch } from '../../../core/models/branch.model';

@Component({
  selector: 'app-table-dialog',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ (data.table ? 'TABLES.EDIT' : 'TABLES.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full">
        <mat-label>{{ 'BRANCHES.TITLE' | translate }}</mat-label>
        <mat-select formControlName="branchId">
          <mat-option *ngFor="let b of branches" [value]="b.id">{{ b.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'TABLES.NUMBER' | translate }}</mat-label><input matInput formControlName="tableNumber" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'TABLES.CAPACITY' | translate }}</mat-label><input matInput type="number" formControlName="capacity" /></mat-form-field>
      <mat-form-field appearance="outline" class="full">
        <mat-label>{{ 'COMMON.STATUS' | translate }}</mat-label>
        <mat-select formControlName="status">
          <mat-option value="AVAILABLE">{{ 'TABLES.AVAILABLE' | translate }}</mat-option>
          <mat-option value="OCCUPIED">{{ 'TABLES.OCCUPIED' | translate }}</mat-option>
          <mat-option value="RESERVED">{{ 'TABLES.RESERVED' | translate }}</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="ref.close(form.getRawValue())">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class TableDialogComponent implements OnInit {
  branches: Branch[] = [];

  readonly form = this.fb.nonNullable.group({
    branchId: [null as number | null, Validators.required],
    tableNumber: ['', Validators.required],
    capacity: [4, Validators.required],
    status: ['AVAILABLE' as TableStatus, Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly branchService: BranchService,
    readonly ref: MatDialogRef<TableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: { table?: RestaurantTable; defaultBranchId?: number }
  ) {}

  ngOnInit(): void {
    this.branchService.list(0, 100).subscribe({ next: (p) => (this.branches = p.content) });
    if (this.data.table) {
      const t = this.data.table;
      this.form.patchValue({ branchId: t.branchId, tableNumber: t.tableNumber, capacity: t.capacity, status: t.status });
    } else if (this.data.defaultBranchId) {
      this.form.patchValue({ branchId: this.data.defaultBranchId });
    }
  }
}
