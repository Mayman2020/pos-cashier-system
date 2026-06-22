import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { Category, CategoryRequest } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ (data ? 'CATEGORIES.EDIT' : 'CATEGORIES.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CATEGORIES.NAME' | translate }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CATEGORIES.DESCRIPTION' | translate }}</mat-label><textarea matInput rows="3" formControlName="description"></textarea></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'CATEGORIES.COLOR' | translate }}</mat-label><input matInput formControlName="color" /></mat-form-field>
      <mat-checkbox formControlName="active">{{ 'COMMON.ACTIVE' | translate }}</mat-checkbox>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="save()">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class CategoryDialogComponent implements OnInit {
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    color: [''],
    sortOrder: [0],
    active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    readonly ref: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: Category | null
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        description: this.data.description ?? '',
        color: this.data.color ?? '',
        sortOrder: this.data.sortOrder ?? 0,
        active: this.data.active !== false,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue() as CategoryRequest);
  }
}
