import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-numeric-keypad',
  standalone: true,
  imports: [NgFor, TranslateModule],
  templateUrl: './numeric-keypad.component.html',
  styleUrl: './numeric-keypad.component.scss',
})
export class PosNumericKeypadComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();
  @Output() enter = new EventEmitter<void>();

  readonly keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  tap(key: string): void {
    if (key === '⌫') {
      const s = String(this.value);
      this.valueChange.emit(s.length <= 1 ? 0 : Number(s.slice(0, -1)));
      return;
    }
    const current = String(this.value === 0 ? '' : this.value);
    if (key === '.' && current.includes('.')) return;
    this.valueChange.emit(Number((current + key).replace(/^\./, '0.')) || 0);
  }

  clear(): void {
    this.valueChange.emit(0);
  }
}
