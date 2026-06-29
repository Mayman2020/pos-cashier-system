import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pos-quick-actions-bar',
  standalone: true,
  imports: [NgIf, TranslateModule],
  templateUrl: './quick-actions-bar.component.html',
  styleUrl: './quick-actions-bar.component.scss',
})
export class PosQuickActionsBarComponent {
  @Input() canManageCustomers = true;
  @Input() canManageProducts = true;
  @Output() newCustomer = new EventEmitter<void>();
  @Output() newProduct = new EventEmitter<void>();
  @Output() openDrawer = new EventEmitter<void>();
  @Output() refund = new EventEmitter<void>();
  @Output() hold = new EventEmitter<void>();
  @Output() search = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();
}
