import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../core/models/product.model';
import { resolveProductImage } from '../pos-demo.util';

@Component({
  selector: 'app-pos-product-card',
  standalone: true,
  imports: [NgIf, TranslateModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class PosProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() priceLabel = '';
  @Input() stock: number | null = null;
  @Input() outOfStock = false;
  @Output() add = new EventEmitter<void>();

  get imageSrc(): string {
    return resolveProductImage(this.product.imageUrl, this.product.name);
  }

  onAdd(e: Event): void {
    e.stopPropagation();
    if (!this.outOfStock) this.add.emit();
  }
}
