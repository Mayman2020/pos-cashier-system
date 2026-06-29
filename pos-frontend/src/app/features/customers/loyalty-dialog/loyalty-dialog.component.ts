import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { LoyaltyService, LoyaltyTransaction } from '../../../core/services/loyalty.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Customer } from '../../../core/models/customer.model';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

export interface LoyaltyDialogData {
  customer: Customer;
}

@Component({
  selector: 'app-loyalty-dialog',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, TranslateModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, RmsDatePipe],
  templateUrl: './loyalty-dialog.component.html',
})
export class LoyaltyDialogComponent implements OnInit {
  loading = true;
  transactions: LoyaltyTransaction[] = [];
  adjustPoints = 0;
  adjustNotes = '';
  balance = 0;

  constructor(
    readonly ref: MatDialogRef<LoyaltyDialogComponent>,
    private readonly loyaltyService: LoyaltyService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    readonly i18n: I18nService,
    @Inject(MAT_DIALOG_DATA) readonly data: LoyaltyDialogData
  ) {}

  ngOnInit(): void {
    this.balance = this.data.customer.loyaltyPoints ?? 0;
    this.load();
  }

  get canAdjust(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  load(): void {
    this.loyaltyService.transactions(this.data.customer.id).subscribe({
      next: (rows) => {
        this.transactions = rows;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  adjust(): void {
    if (!this.adjustPoints) return;
    this.loyaltyService.adjust(this.data.customer.id, this.adjustPoints, this.adjustNotes || undefined).subscribe({
      next: (c) => {
        this.balance = c.loyaltyPoints ?? 0;
        this.adjustPoints = 0;
        this.adjustNotes = '';
        this.snack.success(this.i18n.instant('LOYALTY.ADJUSTED'));
        this.load();
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }
}
