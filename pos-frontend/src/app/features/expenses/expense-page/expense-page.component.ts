import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ExpenseService, Expense } from '../../../core/services/expense.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-expense-page',
  standalone: true,
  imports: [
    NgIf, NgFor, ReactiveFormsModule, TranslateModule, RmsDatePipe,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    PageHeaderComponent, TablePagerComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './expense-page.component.html',
})
export class ExpensePageComponent implements OnInit, OnDestroy {
  loading = true;
  expenses: Expense[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  private branchSub?: Subscription;

  readonly form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    notes: [''],
  });

  constructor(
    private readonly expenseService: ExpenseService,
    private readonly branchContext: BranchContextService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
  }

  get branchId(): number {
    return this.branchContext.getBranchId();
  }

  get canRecord(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  load(): void {
    this.loading = true;
    this.expenseService.list(this.pageIndex, this.pageSize, this.branchId).subscribe({
      next: (page) => {
        this.expenses = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  record(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.expenseService.record(this.branchId, v.amount, v.notes || undefined).subscribe({
      next: () => {
        this.snack.success(this.i18n.instant('EXPENSES.RECORDED'));
        this.form.reset({ amount: 0, notes: '' });
        this.load();
      },
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }

  readonly Number = Number;
}
