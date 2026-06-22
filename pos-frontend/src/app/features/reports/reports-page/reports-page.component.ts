import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import {
  BranchSalesReport,
  CashierSalesReport,
  LowStockReportItem,
  PaymentMethodReport,
  ProfitReport,
  SalesReport,
  TopProduct,
} from '../../../core/models/report.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule, TranslateModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    PageHeaderComponent, StatCardComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent implements OnInit {
  loading = false;
  dailySales: SalesReport | null = null;
  monthlySales: SalesReport | null = null;
  topProducts: TopProduct[] = [];
  profit: ProfitReport | null = null;
  paymentMethods: PaymentMethodReport[] = [];
  cashierSales: CashierSalesReport[] = [];
  branchSales: BranchSalesReport[] = [];
  lowStockReport: LowStockReportItem[] = [];

  readonly filterForm = this.fb.nonNullable.group({
    date: [new Date().toISOString().slice(0, 10)],
    from: [new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)],
    to: [new Date().toISOString().slice(0, 10)],
    year: [new Date().getFullYear()],
    month: [new Date().getMonth() + 1],
  });

  constructor(
    private readonly reportService: ReportService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  get branchId(): number | undefined {
    return this.auth.getCurrentUser()?.branchId;
  }

  loadAll(): void {
    this.loading = true;
    const v = this.filterForm.getRawValue();
    const branchId = this.branchId;
    let pending = 8;
    const done = () => {
      pending -= 1;
      if (pending <= 0) this.loading = false;
    };

    this.reportService.dailySales(v.date, branchId).subscribe({ next: (d) => { this.dailySales = d; done(); }, error: done });
    this.reportService.monthlySales(v.year, v.month, branchId).subscribe({ next: (d) => { this.monthlySales = d; done(); }, error: done });
    this.reportService.topProducts(v.from, v.to, branchId).subscribe({ next: (d) => { this.topProducts = d; done(); }, error: done });
    this.reportService.profit(v.year, v.month, branchId).subscribe({ next: (d) => { this.profit = d; done(); }, error: done });
    this.reportService.paymentMethods(v.from, v.to, branchId).subscribe({ next: (d) => { this.paymentMethods = d; done(); }, error: done });
    this.reportService.cashierSales(v.from, v.to, branchId).subscribe({ next: (d) => { this.cashierSales = d; done(); }, error: done });
    this.reportService.branchSales(v.from, v.to).subscribe({ next: (d) => { this.branchSales = d; done(); }, error: done });
    this.reportService.lowStock(branchId).subscribe({ next: (d) => { this.lowStockReport = d; done(); }, error: done });
  }

  productSales(p: TopProduct): number {
    return Number((p as TopProduct & { totalRevenue?: number }).totalRevenue ?? p.totalSales ?? 0);
  }

  paymentCount(m: PaymentMethodReport): number {
    return Number(m.transactionCount ?? m.count ?? 0);
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }

  readonly Number = Number;
}
