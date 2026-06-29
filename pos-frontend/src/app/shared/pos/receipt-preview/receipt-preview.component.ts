import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Receipt } from '../../../core/models/receipt.model';

@Component({
  selector: 'app-pos-receipt-preview',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule],
  templateUrl: './receipt-preview.component.html',
  styleUrl: './receipt-preview.component.scss',
})
export class PosReceiptPreviewComponent {
  @Input() receipt: Receipt | null = null;
  @Input() formatMoney: (v: number) => string = (v) => String(v);
  @Output() print = new EventEmitter<void>();
  @Output() printThermal = new EventEmitter<void>();
}
