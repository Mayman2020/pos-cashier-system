import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Location, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, TranslateModule],
  template: `
    <header class="app-page-header">
      <div class="page-heading">
        <nav class="app-breadcrumb" *ngIf="breadcrumbs.length">
          <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
            <a *ngIf="!last && crumb.route" [routerLink]="crumb.route">{{ crumb.label }}</a>
            <span *ngIf="last">{{ crumb.label }}</span>
            <span class="sep" *ngIf="!last">/</span>
          </ng-container>
        </nav>
        <h1 class="app-page-title">{{ title }}</h1>
        <p class="app-page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
        <button *ngIf="showBack" type="button" class="app-back-btn" (click)="onBack()">
          <span class="material-icons">arrow_back</span>
          {{ 'COMMON.BACK' | translate }}
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      :host { display: block; }
      .page-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .app-breadcrumb { font-size: 0.78rem; color: var(--text-subtle); margin-bottom: 10px; }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() showBack = false;
  @Output() backClick = new EventEmitter<void>();

  constructor(private readonly location: Location) {}

  onBack(): void {
    if (this.backClick.observed) this.backClick.emit();
    else this.location.back();
  }
}
