import { Component, Inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  alertOnly?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NgIf, NgClass, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content>
      <p>{{ data.message | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button *ngIf="!data.alertOnly" mat-stroked-button type="button" (click)="ref.close(false)">
        {{ (data.cancelLabel || 'ACTIONS.CANCEL') | translate }}
      </button>
      <button mat-flat-button type="button" [class.btn-dialog-danger]="data.danger" (click)="ref.close(true)">
        {{ (data.confirmLabel || 'COMMON.CONFIRM') | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    readonly ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: ConfirmDialogData
  ) {}
}
