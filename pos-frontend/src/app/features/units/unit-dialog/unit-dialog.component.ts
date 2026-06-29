import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Unit, UnitRequest } from '../../../core/models/unit.model';

@Component({
  selector: 'app-unit-dialog',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ (data ? 'UNITS.EDIT' : 'UNITS.CREATE') | translate }}</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'UNITS.CODE' | translate }}</mat-label><input matInput formControlName="code" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'UNITS.NAME' | translate }}</mat-label><input matInput formControlName="name" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>{{ 'UNITS.SYMBOL' | translate }}</mat-label><input matInput formControlName="symbol" /></mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" [disabled]="form.invalid" (click)="save()">{{ 'ACTIONS.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.full { width: 100%; display: block; }`],
})
export class UnitDialogComponent {
  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    symbol: [''],
  });

  constructor(
    private readonly fb: FormBuilder,
    readonly ref: MatDialogRef<UnitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: Unit | null
  ) {
    if (data) {
      this.form.patchValue({ code: data.code, name: data.name, symbol: data.symbol ?? '' });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue() as UnitRequest);
  }
}
