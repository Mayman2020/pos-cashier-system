import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { ShiftService } from '../../../core/services/shift.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Shift } from '../../../core/models/shift.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TablePagerComponent } from '../../../shared/components/table-pager/table-pager.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-shift-list',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, ReactiveFormsModule, TranslateModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule,
    PageHeaderComponent, TablePagerComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './shift-list.component.html',
  styleUrl: './shift-list.component.scss',
})
export class ShiftListComponent implements OnInit {
  loading = true;
  shifts: Shift[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  showOpenForm = false;
  currentOpenShift: Shift | null = null;

  readonly openForm = this.fb.nonNullable.group({ openingCash: [0, Validators.min(0)] });
  readonly closeForm = this.fb.nonNullable.group({ actualCash: [0, Validators.required], notes: [''] });
  closingShift: Shift | null = null;

  constructor(
    private readonly shiftService: ShiftService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
    this.shiftService.getCurrentOpen().subscribe({ next: (s) => (this.currentOpenShift = s) });
  }

  get branchId(): number {
    return this.auth.getCurrentUser()?.branchId ?? 1;
  }

  load(): void {
    this.loading = true;
    this.shiftService.list(this.pageIndex, this.pageSize, this.branchId).subscribe({
      next: (page) => {
        this.shifts = page.content;
        this.total = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openShift(): void {
    this.shiftService.open({ branchId: this.branchId, openingCash: this.openForm.value.openingCash ?? 0 }).subscribe({
      next: (shift) => {
        this.currentOpenShift = shift;
        this.snack.success(this.i18n.instant('SHIFTS.OPENED_MSG'));
        this.showOpenForm = false;
        this.load();
      },
      error: (e: Error) => this.snack.error(e.message),
    });
  }

  startClose(shift: Shift): void {
    this.closingShift = shift;
    this.closeForm.patchValue({ actualCash: Number(shift.expectedCash ?? 0), notes: '' });
  }

  closeShift(): void {
    if (!this.closingShift || this.closeForm.invalid) return;
    const v = this.closeForm.getRawValue();
    this.shiftService.close(this.closingShift.id, v).subscribe({
      next: () => {
        this.currentOpenShift = null;
        this.snack.success(this.i18n.instant('SHIFTS.CLOSED'));
        this.closingShift = null;
        this.load();
      },
      error: (e: Error) => this.snack.error(e.message),
    });
  }

  fmtMoney(v?: number): string {
    return this.i18n.formatCurrency(Number(v ?? 0));
  }
}
