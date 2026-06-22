import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import {
  BranchSalesReport,
  CashierSalesReport,
  LowStockReportItem,
  PaymentMethodReport,
  ProfitReport,
  SalesReport,
  TopProduct,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private readonly api: ApiService) {}

  dailySales(date: string, branchId?: number): Observable<SalesReport> {
    return this.api.get<SalesReport>(AppConstants.API.REPORTS_DAILY_SALES, { date, branchId });
  }

  monthlySales(year: number, month: number, branchId?: number): Observable<SalesReport> {
    return this.api.get<SalesReport>(AppConstants.API.REPORTS_MONTHLY_SALES, { year, month, branchId });
  }

  topProducts(from: string, to: string, branchId?: number, limit = 10): Observable<TopProduct[]> {
    return this.api.get<TopProduct[]>(AppConstants.API.REPORTS_TOP_PRODUCTS, { from, to, branchId, limit });
  }

  profit(year: number, month: number, branchId?: number): Observable<ProfitReport> {
    return this.api.get<ProfitReport>(AppConstants.API.REPORTS_PROFIT, { year, month, branchId });
  }

  paymentMethods(from: string, to: string, branchId?: number): Observable<PaymentMethodReport[]> {
    return this.api.get<PaymentMethodReport[]>(AppConstants.API.REPORTS_PAYMENT_METHODS, { from, to, branchId });
  }

  cashierSales(from: string, to: string, branchId?: number): Observable<CashierSalesReport[]> {
    return this.api.get<CashierSalesReport[]>(AppConstants.API.REPORTS_CASHIER_SALES, { from, to, branchId });
  }

  branchSales(from: string, to: string): Observable<BranchSalesReport[]> {
    return this.api.get<BranchSalesReport[]>(AppConstants.API.REPORTS_BRANCH_SALES, { from, to });
  }

  lowStock(branchId?: number): Observable<LowStockReportItem[]> {
    return this.api.get<LowStockReportItem[]>(AppConstants.API.REPORTS_LOW_STOCK, { branchId });
  }
}
