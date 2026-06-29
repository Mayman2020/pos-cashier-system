import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { DashboardSummary } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, TranslateModule, PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  summary: DashboardSummary | null = null;
  private branchSub?: Subscription;

  constructor(
    private readonly dashboard: DashboardService,
    private readonly branchContext: BranchContextService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  private load(): void {
    this.loading = true;
    this.dashboard.getSummary(this.branchContext.getBranchId()).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get cashShare(): number {
    if (!this.summary?.todaySales) return 0;
    return Math.round((Number(this.summary.todayCashSales ?? 0) / Number(this.summary.todaySales)) * 100);
  }

  get cardShare(): number {
    if (!this.summary?.todaySales) return 0;
    return Math.round((Number(this.summary.todayCardSales ?? 0) / Number(this.summary.todaySales)) * 100);
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }
}
