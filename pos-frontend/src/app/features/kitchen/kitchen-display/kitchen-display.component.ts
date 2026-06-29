import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription, switchMap } from 'rxjs';
import { KitchenService, KitchenStatus } from '../../../core/services/kitchen.service';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PosOrder } from '../../../core/models/order.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { RmsDatePipe } from '../../../shared/pipes/rms-date.pipe';

@Component({
  selector: 'app-kitchen-display',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, MatButtonModule, MatIconModule, PageHeaderComponent, LoadingSpinnerComponent, RmsDatePipe],
  templateUrl: './kitchen-display.component.html',
  styleUrl: './kitchen-display.component.scss',
})
export class KitchenDisplayComponent implements OnInit, OnDestroy {
  loading = true;
  orders: PosOrder[] = [];
  private pollSub?: Subscription;
  private branchSub?: Subscription;

  readonly columns: KitchenStatus[] = ['PENDING', 'PREPARING', 'READY'];

  constructor(
    private readonly kitchenService: KitchenService,
    private readonly branchContext: BranchContextService,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.load();
    this.branchSub = this.branchContext.branchChanged$.subscribe(() => this.load());
    this.pollSub = interval(10000)
      .pipe(switchMap(() => this.kitchenService.queue(this.branchId)))
      .subscribe({
        next: (rows) => (this.orders = rows),
        error: () => {},
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.branchSub?.unsubscribe();
  }

  get branchId(): number {
    return this.branchContext.getBranchId();
  }

  load(): void {
    this.loading = true;
    this.kitchenService.queue(this.branchId).subscribe({
      next: (rows) => {
        this.orders = rows;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  ordersFor(status: KitchenStatus): PosOrder[] {
    return this.orders.filter((o) => o.kitchenStatus === status);
  }

  nextStatus(current: KitchenStatus): KitchenStatus | null {
    if (current === 'PENDING') return 'PREPARING';
    if (current === 'PREPARING') return 'READY';
    if (current === 'READY') return 'SERVED';
    return null;
  }

  advance(order: PosOrder): void {
    const next = this.nextStatus(order.kitchenStatus ?? 'PENDING');
    if (!next) return;
    this.kitchenService.updateStatus(order.id, next).subscribe({
      next: () => this.load(),
      error: (e: Error) => this.snack.error(e.message),
    });
  }

  orderTypeLabel(type?: string): string {
    if (!type) return '';
    return this.i18n.instant(`POS.TYPE_${type}`);
  }

  actionLabel(status: KitchenStatus): string {
    const next = this.nextStatus(status);
    if (!next) return '';
    return this.i18n.instant(`KITCHEN.MOVE_TO_${next}`);
  }
}
