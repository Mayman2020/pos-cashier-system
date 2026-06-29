import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-pos-category-tabs',
  standalone: true,
  imports: [NgFor, TranslateModule],
  templateUrl: './category-tabs.component.html',
  styleUrl: './category-tabs.component.scss',
})
export class PosCategoryTabsComponent {
  @Input() categories: Category[] = [];
  @Input() selectedId: number | null = null;
  @Output() selectedIdChange = new EventEmitter<number | null>();

  select(id: number | null): void {
    this.selectedIdChange.emit(id);
  }
}
