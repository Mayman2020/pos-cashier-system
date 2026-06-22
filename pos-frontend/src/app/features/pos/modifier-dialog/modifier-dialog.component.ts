import { Component, Inject } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { ProductModifier, SelectedModifier } from '../../../core/models/modifier.model';

export interface ModifierDialogData {
  productName: string;
  modifiers: ProductModifier[];
}

@Component({
  selector: 'app-modifier-dialog',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, FormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'POS.MODIFIERS' | translate }} — {{ data.productName }}</h2>
    <mat-dialog-content>
      <div *ngIf="!data.modifiers.length">{{ 'POS.NO_MODIFIERS' | translate }}</div>
      <label class="mod-row" *ngFor="let m of data.modifiers">
        <mat-checkbox [(ngModel)]="selected[m.id]">{{ m.name }} (+{{ m.priceAdjustment | number:'1.2-2' }})</mat-checkbox>
      </label>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-flat-button type="button" (click)="confirm()">{{ 'ACTIONS.CONFIRM' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`.mod-row { display: block; margin: 8px 0; }`],
})
export class ModifierDialogComponent {
  selected: Record<number, boolean> = {};

  constructor(
    readonly ref: MatDialogRef<ModifierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: ModifierDialogData
  ) {}

  confirm(): void {
    const picked: SelectedModifier[] = this.data.modifiers
      .filter((m) => this.selected[m.id])
      .map((m) => ({ id: m.id, name: m.name, priceAdjustment: Number(m.priceAdjustment) }));
    this.ref.close(picked);
  }
}
