import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../core/services/order.service';
import { ReceiptService } from '../../../core/services/receipt.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PosOrder, PaymentMethod, RefundItemRequest } from '../../../core/models/order.model';
import { ReceiptDialogComponent } from '../../pos/receipt-dialog/receipt-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface OrderDetailDialogData {
  orderId: number;
  canRefund?: boolean;
}

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  templateUrl: './order-detail-dialog.component.html',
  styleUrl: './order-detail-dialog.component.scss',
})
export class OrderDetailDialogComponent implements OnInit {
  loading = true;
  order: PosOrder | null = null;
  refundReason = '';
  refundMethod: PaymentMethod = 'CASH';
  refundSelections: Record<number, number> = {};

  constructor(
    readonly ref: MatDialogRef<OrderDetailDialogComponent>,
    private readonly orderService: OrderService,
    private readonly receiptService: ReceiptService,
    private readonly dialog: MatDialog,
    readonly i18n: I18nService,
    @Inject(MAT_DIALOG_DATA) readonly data: OrderDetailDialogData
  ) {}

  ngOnInit(): void {
    this.orderService.getById(this.data.orderId).subscribe({
      next: (o) => {
        this.order = o;
        (o.items ?? []).forEach((item) => {
          if (item.id != null) {
            this.refundSelections[item.id] = 0;
          }
        });
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get canRefund(): boolean {
    return !!this.data.canRefund && (this.order?.status === 'PAID' || this.order?.status === 'PARTIALLY_REFUNDED');
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }

  viewReceipt(): void {
    if (!this.order) return;
    this.receiptService.get(this.order.id).subscribe({
      next: (receipt) => {
        this.dialog.open(ReceiptDialogComponent, {
          panelClass: 'app-dialog-panel',
          width: '480px',
          data: receipt,
        });
      },
    });
  }

  fullRefund(): void {
    if (!this.order) return;
    this.orderService.refund(this.order.id, { reason: this.refundReason, refundMethod: this.refundMethod }).subscribe({
      next: (o) => {
        this.order = o;
        this.ref.close(true);
      },
    });
  }

  partialRefund(): void {
    if (!this.order) return;
    const items: RefundItemRequest[] = Object.entries(this.refundSelections)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ orderItemId: Number(id), quantity: qty }));
    if (!items.length) return;
    this.orderService
      .refund(this.order.id, { reason: this.refundReason, refundMethod: this.refundMethod, items })
      .subscribe({
        next: (o) => {
          this.order = o;
          this.ref.close(true);
        },
      });
  }
}
