import { Component, Inject, OnInit } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CashDrawerMovement, ShiftService } from '../../../core/services/shift.service';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Shift } from '../../../core/models/shift.model';

export interface CloseShiftDialogData {
  shift: Shift;
}

@Component({
  selector: 'app-close-shift-dialog',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, FormsModule, TranslateModule, MatDialogModule, MatButtonModule],
  templateUrl: './close-shift-dialog.component.html',
  styleUrl: './close-shift-dialog.component.scss',
})
export class CloseShiftDialogComponent implements OnInit {
  actualCash = 0;
  notes = '';
  movements: CashDrawerMovement[] = [];
  loadingMovements = true;
  payoutAmount = 0;
  varianceThreshold = 50;

  readonly keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  constructor(
    readonly ref: MatDialogRef<CloseShiftDialogComponent>,
    private readonly shiftService: ShiftService,
    private readonly auth: AuthService,
    private readonly settingsService: SettingsService,
    @Inject(MAT_DIALOG_DATA) readonly data: CloseShiftDialogData
  ) {}

  ngOnInit(): void {
    this.actualCash = this.expectedCash;
    this.settingsService.getPos().subscribe({
      next: (s) => {
        const v = Number(s.settings?.['cash_variance_threshold']);
        if (!Number.isNaN(v) && v > 0) this.varianceThreshold = v;
      },
    });
    this.shiftService.drawerMovements(this.data.shift.id).subscribe({
      next: (rows) => {
        this.movements = rows;
        this.loadingMovements = false;
      },
      error: () => (this.loadingMovements = false),
    });
  }

  get shift(): Shift {
    return this.data.shift;
  }

  get openingCash(): number {
    return Number(this.shift.openingCash ?? 0);
  }

  get cashSales(): number {
    return Number(this.shift.totalCashSales ?? 0);
  }

  get cardSales(): number {
    return Number(this.shift.totalCardSales ?? 0);
  }

  get refundsCash(): number {
    return Number(this.shift.totalRefundsCash ?? 0);
  }

  get payouts(): number {
    return Number(this.shift.totalPayouts ?? 0);
  }

  get expectedCash(): number {
    return this.openingCash + this.cashSales - this.refundsCash - this.payouts;
  }

  get variance(): number {
    return this.actualCash - this.expectedCash;
  }

  get varianceWarning(): boolean {
    return Math.abs(this.variance) > this.varianceThreshold;
  }

  get canRecordPayout(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  tapKey(key: string): void {
    if (key === '⌫') {
      const s = String(this.actualCash);
      this.actualCash = s.length <= 1 ? 0 : Number(s.slice(0, -1));
      return;
    }
    const current = String(this.actualCash === 0 ? '' : this.actualCash);
    if (key === '.' && current.includes('.')) return;
    this.actualCash = Number((current + key).replace(/^\./, '0.')) || 0;
  }

  recordPayout(): void {
    if (this.payoutAmount <= 0) return;
    this.shiftService.payout(this.shift.id, this.payoutAmount, 'Drawer payout').subscribe({
      next: (shift) => {
        this.data.shift = shift;
        this.payoutAmount = 0;
        this.actualCash = this.expectedCash;
        this.shiftService.drawerMovements(this.shift.id).subscribe({
          next: (rows) => (this.movements = rows),
        });
      },
    });
  }

  confirm(): void {
    this.ref.close({
      actualCash: this.actualCash,
      notes: this.notes,
      forceClose: this.varianceWarning,
    });
  }
}
