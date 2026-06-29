import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentMethod } from '../../../core/models/order.model';

@Component({
  selector: 'app-pos-checkout-modal',
  standalone: true,
  imports: [NgIf, FormsModule, TranslateModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './checkout-modal.component.html',
  styleUrl: './checkout-modal.component.scss',
})
export class PosCheckoutModalComponent {
  @Input() open = false;
  @Input() total = 0;
  @Input() processing = false;
  @Input() paymentMethod: PaymentMethod = 'CASH';
  @Input() amountTendered = 0;
  @Input() cashAmount = 0;
  @Input() cardAmount = 0;
  @Input() changeDue = 0;
  @Input() formatMoney: (v: number) => string = (v) => String(v);

  @Output() paymentMethodChange = new EventEmitter<PaymentMethod>();
  @Output() amountTenderedChange = new EventEmitter<number>();
  @Output() cashAmountChange = new EventEmitter<number>();
  @Output() cardAmountChange = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
