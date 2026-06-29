import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PosCartLine } from '../pos-cart.model';
import { resolveProductImage } from '../pos-demo.util';

@Component({
  selector: 'app-pos-cart-panel',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, FormsModule, TranslateModule],
  templateUrl: './cart-panel.component.html',
  styleUrl: './cart-panel.component.scss',
})
export class PosCartPanelComponent {
  @Input() lines: PosCartLine[] = [];
  @Input() cartCount = 0;
  @Input() subtotal = 0;
  @Input() tax = 0;
  @Input() discount = 0;
  @Input() total = 0;
  @Input() orderDiscount = 0;
  @Input() orderNote = '';
  @Input() blocked = false;
  @Input() allowManualDiscount = true;
  @Input() formatMoney: (v: number) => string = (v) => String(v);
  @Input() modifierLabel: (line: PosCartLine) => string = () => '';
  @Input() lineUnitPrice: (line: PosCartLine) => number = () => 0;

  @Output() orderDiscountChange = new EventEmitter<number>();
  @Output() orderNoteChange = new EventEmitter<string>();
  @Output() qtyChange = new EventEmitter<{ line: PosCartLine; delta: number }>();
  @Output() clear = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();
  @Output() hold = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  lineImage(line: PosCartLine): string {
    return resolveProductImage(line.product.imageUrl, line.product.name);
  }
}
