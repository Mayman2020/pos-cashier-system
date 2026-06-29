import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { LookupItem, LookupService, LookupType } from '../../../core/services/lookup.service';
import { SnackService } from '../../../core/services/snack.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LookupDialogComponent } from '../lookup-dialog/lookup-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface LookupTab {
  type: LookupType;
  labelKey: string;
  items: LookupItem[];
  loading: boolean;
}

@Component({
  selector: 'app-lookup-management',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    TranslateModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  template: `
    <div class="app-page">
      <app-page-header [title]="'LOOKUPS.TITLE' | translate" [subtitle]="'LOOKUPS.SUBTITLE' | translate">
        <button class="app-icon-btn" type="button" (click)="loadAll()" [title]="'COMMON.REFRESH' | translate">
          <span class="material-icons">refresh</span>
        </button>
      </app-page-header>

      <div class="app-card lookup-card">
        <mat-tab-group animationDuration="200ms">
          <mat-tab *ngFor="let tab of tabs" [label]="tab.labelKey | translate">
            <div class="lookup-body">
              <div class="lookup-toolbar">
                <button mat-flat-button type="button" (click)="openCreate(tab)">{{ 'LOOKUPS.NEW' | translate }}</button>
              </div>
              <div class="loading-wrap" *ngIf="tab.loading">
                <mat-spinner diameter="36"></mat-spinner>
              </div>
              <div class="app-table-wrap" *ngIf="!tab.loading && tab.items.length">
                <table class="app-data-table">
                  <thead>
                    <tr>
                      <th>{{ 'LOOKUPS.CODE' | translate }}</th>
                      <th>{{ 'LOOKUPS.NAME_AR' | translate }}</th>
                      <th>{{ 'LOOKUPS.NAME_EN' | translate }}</th>
                      <th>{{ 'LOOKUPS.SORT_ORDER' | translate }}</th>
                      <th>{{ 'COMMON.STATUS' | translate }}</th>
                      <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of tab.items">
                      <td>{{ item.code }}</td>
                      <td>{{ item.nameAr }}</td>
                      <td>{{ item.nameEn }}</td>
                      <td>{{ item.sortOrder }}</td>
                      <td>{{ (item.active ? 'LOOKUPS.ACTIVE' : 'LOOKUPS.INACTIVE') | translate }}</td>
                      <td class="actions-cell">
                        <button class="app-icon-btn" type="button" (click)="openEdit(tab, item)">
                          <span class="material-icons">edit</span>
                        </button>
                        <button class="app-icon-btn danger" type="button" *ngIf="!item.locked" (click)="remove(tab, item)">
                          <span class="material-icons">delete</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="empty-state" *ngIf="!tab.loading && !tab.items.length">{{ 'COMMON.NO_DATA' | translate }}</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .lookup-card {
      overflow: hidden;
    }

    .lookup-body {
      padding: 14px 20px 20px;
    }

    .lookup-toolbar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }

    .empty-state {
      margin: 0;
      text-align: center;
      color: var(--text-muted);
      padding: 26px;
    }
  `],
})
export class LookupManagementComponent implements OnInit {
  tabs: LookupTab[] = [
    { type: 'ORDER_CHANNEL', labelKey: 'LOOKUPS.TAB_ORDER_CHANNEL', items: [], loading: false },
    { type: 'PAYMENT_METHOD', labelKey: 'LOOKUPS.TAB_PAYMENT', items: [], loading: false },
    { type: 'TABLE_ZONE', labelKey: 'LOOKUPS.TAB_TABLE_ZONE', items: [], loading: false },
    { type: 'INVENTORY_UNIT', labelKey: 'LOOKUPS.TAB_INVENTORY_UNIT', items: [], loading: false },
    { type: 'EXPENSE_TYPE', labelKey: 'LOOKUPS.TAB_EXPENSE_TYPE', items: [], loading: false },
  ];

  constructor(
    private readonly lookupService: LookupService,
    private readonly dialog: MatDialog,
    private readonly snack: SnackService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.tabs.forEach((tab) => this.loadTab(tab));
  }

  openCreate(tab: LookupTab): void {
    this.dialog
      .open(LookupDialogComponent, { width: '520px', data: { type: tab.type } })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) this.loadTab(tab);
      });
  }

  openEdit(tab: LookupTab, item: LookupItem): void {
    this.dialog
      .open(LookupDialogComponent, { width: '520px', data: { type: tab.type, item } })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) this.loadTab(tab);
      });
  }

  remove(tab: LookupTab, item: LookupItem): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        panelClass: 'app-dialog-panel',
        data: { title: 'COMMON.DELETE', message: 'LOOKUPS.DELETE_MSG', danger: true },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) return;
        this.lookupService.delete(item.id).subscribe({
          next: () => {
            this.snack.success('Deleted');
            this.loadTab(tab);
          },
          error: (error: Error) => this.snack.error(error.message),
        });
      });
  }

  private loadTab(tab: LookupTab): void {
    tab.loading = true;
    this.lookupService.getAllByType(tab.type).subscribe({
      next: (items) => {
        tab.items = items ?? [];
        tab.loading = false;
      },
      error: (error: Error) => {
        this.snack.error(error.message);
        tab.loading = false;
      },
    });
  }
}
