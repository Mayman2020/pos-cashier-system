import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface PosReportCard {
  icon: string;
  labelKey: string;
  value: string;
  accent?: string;
}

@Component({
  selector: 'app-pos-reports-cards',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule],
  templateUrl: './reports-cards.component.html',
  styleUrl: './reports-cards.component.scss',
})
export class PosReportsCardsComponent {
  @Input() cards: PosReportCard[] = [];
}
