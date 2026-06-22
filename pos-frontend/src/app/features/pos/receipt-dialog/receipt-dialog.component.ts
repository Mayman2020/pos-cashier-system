import { Component, Inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ThermalPrintService } from '../../../core/services/thermal-print.service';
import { Receipt } from '../../../core/models/receipt.model';

@Component({
  selector: 'app-receipt-dialog',
  standalone: true,
  imports: [NgIf, NgFor, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'POS.RECEIPT' | translate }} — {{ data.receiptNumber }}</h2>
    <mat-dialog-content class="receipt-body">
      <p><strong>{{ 'ORDERS.NUMBER' | translate }}:</strong> {{ data.order.orderNumber }}</p>
      <p><strong>{{ 'COMMON.DATE' | translate }}:</strong> {{ data.printedAt }}</p>
      <hr />
      <div class="line" *ngFor="let item of data.order.items">
        <span>{{ item.productName }} × {{ item.quantity }}</span>
        <span>{{ fmt(item.lineTotal) }}</span>
      </div>
      <hr />
      <div class="line"><span>{{ 'POS.SUBTOTAL' | translate }}</span><span>{{ fmt(data.order.subtotal) }}</span></div>
      <div class="line"><span>{{ 'POS.TAX' | translate }}</span><span>{{ fmt(data.order.taxAmount) }}</span></div>
      <div class="line"><span>{{ 'POS.DISCOUNT' | translate }}</span><span>-{{ fmt(data.order.discountAmount) }}</span></div>
      <div class="line total"><strong>{{ 'POS.TOTAL' | translate }}</strong><strong>{{ fmt(data.order.totalAmount) }}</strong></div>
      <div class="line" *ngFor="let p of data.payments">
        <span>{{ ('PAYMENT.' + p.paymentMethod) | translate }}</span><span>{{ fmt(p.amount) }}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close()">{{ 'ACTIONS.CANCEL' | translate }}</button>
      <button mat-stroked-button type="button" (click)="print()">{{ 'POS.PRINT' | translate }}</button>
      <button mat-flat-button type="button" (click)="printThermal()">{{ 'POS.PRINT_THERMAL' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .receipt-body { min-width: 320px; }
    .line { display: flex; justify-content: space-between; gap: 12px; margin: 6px 0; }
    .total { font-size: 1.1rem; margin-top: 8px; }
  `],
})
export class ReceiptDialogComponent {
  constructor(
    readonly ref: MatDialogRef<ReceiptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: Receipt,
    private readonly i18n: I18nService,
    private readonly thermalPrint: ThermalPrintService
  ) {}

  fmt(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }

  print(): void {
    window.print();
  }

  printThermal(): void {
    this.thermalPrint.printReceipt(this.data, (v) => this.fmt(v), {
      title: this.i18n.instant('POS.RECEIPT'),
      subtotal: this.i18n.instant('POS.SUBTOTAL'),
      tax: this.i18n.instant('POS.TAX'),
      discount: this.i18n.instant('POS.DISCOUNT'),
      total: this.i18n.instant('POS.TOTAL'),
      thankYou: this.i18n.instant('POS.THANK_YOU'),
      paymentLabel: (method) => this.i18n.instant(`PAYMENT.${method}`),
    });
  }
}
