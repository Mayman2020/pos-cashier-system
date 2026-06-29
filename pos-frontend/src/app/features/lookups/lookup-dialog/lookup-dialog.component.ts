import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LookupItem, LookupService, LookupType } from '../../../core/services/lookup.service';
import { SnackService } from '../../../core/services/snack.service';

export interface LookupDialogData {
  type: LookupType;
  item?: LookupItem;
}

@Component({
  selector: 'app-lookup-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ (data.item ? 'ACTIONS.EDIT' : 'LOOKUPS.NEW') | translate }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <div class="dialog-form">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'LOOKUPS.CODE' | translate }}</mat-label>
            <input matInput formControlName="code" [readonly]="!!data.item?.locked" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'LOOKUPS.SORT_ORDER' | translate }}</mat-label>
            <input matInput type="number" formControlName="sortOrder" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'LOOKUPS.NAME_AR' | translate }}</mat-label>
            <input matInput formControlName="nameAr" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>{{ 'LOOKUPS.NAME_EN' | translate }}</mat-label>
            <input matInput formControlName="nameEn" />
          </mat-form-field>
          <mat-checkbox *ngIf="data.item" formControlName="active">{{ 'LOOKUPS.ACTIVE' | translate }}</mat-checkbox>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" mat-dialog-close>{{ 'ACTIONS.CANCEL' | translate }}</button>
        <button mat-flat-button type="submit" [disabled]="form.invalid">{{ 'ACTIONS.SAVE' | translate }}</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-form {
      display: grid;
      gap: 12px;
      min-width: min(460px, 82vw);
    }
  `],
})
export class LookupDialogComponent implements OnInit {
  form = this.fb.group({
    code: [''],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    sortOrder: [0],
    active: [true],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly snack: SnackService,
    private readonly dialogRef: MatDialogRef<LookupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LookupDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.item) {
      this.form.patchValue({
        code: this.data.item.code,
        nameAr: this.data.item.nameAr,
        nameEn: this.data.item.nameEn,
        sortOrder: this.data.item.sortOrder,
        active: this.data.item.active,
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const request = this.data.item
      ? this.lookupService.update(this.data.item.id, {
          code: value.code ?? '',
          nameAr: value.nameAr ?? '',
          nameEn: value.nameEn ?? '',
          sortOrder: value.sortOrder ?? 0,
          active: value.active ?? true,
        })
      : this.lookupService.create({
          type: this.data.type,
          code: value.code || undefined,
          nameAr: value.nameAr ?? '',
          nameEn: value.nameEn ?? '',
          sortOrder: value.sortOrder ?? 0,
        });

    request.subscribe({
      next: () => {
        this.snack.success('Saved');
        this.dialogRef.close(true);
      },
      error: (error: Error) => this.snack.error(error.message),
    });
  }
}
