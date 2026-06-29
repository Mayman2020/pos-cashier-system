import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NavigationHistoryService } from '../../../core/services/navigation-history.service';

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
        <button
          *ngIf="canGoBack"
          type="button"
          class="app-icon-btn page-back-btn"
          [attr.aria-label]="'COMMON.BACK' | translate"
          [title]="'COMMON.BACK' | translate"
          (click)="onBack()">
          <span class="material-icons">arrow_back</span>
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      :host { display: block; }
      .page-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .app-breadcrumb { font-size: 0.78rem; color: var(--text-subtle); margin-bottom: 10px; }
      .page-back-btn .material-icons { font-size: 20px; }
      :host-context([dir='rtl']) .page-back-btn .material-icons { transform: scaleX(-1); }
    `,
  ],
})
export class PageHeaderComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  canGoBack = false;
  private navSub?: Subscription;

  constructor(
    private readonly location: Location,
    private readonly navHistory: NavigationHistoryService
  ) {}

  ngOnInit(): void {
    this.canGoBack = this.navHistory.canGoBack();
    this.navSub = this.navHistory.canGoBack$.subscribe((value) => {
      this.canGoBack = value;
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  onBack(): void {
    this.navHistory.goBack(this.location);
  }
}
