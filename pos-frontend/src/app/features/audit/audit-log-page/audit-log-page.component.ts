import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-audit-log-page',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, PageHeaderComponent, TablePagerComponent, LoadingSpinnerComponent, RmsDatePipe],
  templateUrl: './audit-log-page.component.html',
})
export class AuditLogPageComponent implements OnInit, OnDestroy {
  loading = true;
  logs: AuditLog[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 20;
  private branchSub?: Subscription;

  constructor(
    private readonly auditService: AuditLogService,
    private readonly branchContext: BranchContextService
  ) {}

  ngOnInit(): void {
    this.load();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.auditService.list(this.pageIndex, this.pageSize, this.branchContext.getBranchId()).subscribe({
      next: (page) => {
        this.logs = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
