import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../core/services/settings.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    NgIf, NgFor, FormsModule, TranslateModule,
    MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatTabsModule,
    PageHeaderComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './settings-page.component.html',
  styles: [`
    .settings-section { display: grid; gap: 16px; max-width: 560px; padding: 16px 0; }
    .setting-field { display: grid; gap: 6px; }
    .setting-field label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .setting-field input { min-height: 44px; border: 1px solid var(--line); border-radius: 10px; padding: 0 12px; }
    .toggle-row { display: flex; align-items: center; gap: 12px; }
  `],
})
export class SettingsPageComponent implements OnInit {
  loading = true;
  settings: Record<string, string> = {};

  readonly generalKeys = ['business_name', 'currency'];
  readonly posKeys = ['tax_inclusive', 'allow_manual_discount', 'cash_variance_threshold'];
  readonly modeKeys = ['restaurant_mode', 'supermarket_mode', 'low_stock_alert'];
  readonly loyaltyKeys = ['loyalty_points_per_currency', 'loyalty_redeem_value'];

  constructor(
    private readonly settingsService: SettingsService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: (res) => {
        this.settings = { ...(res.settings ?? {}) };
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get canEdit(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  isBool(key: string): boolean {
    return ['tax_inclusive', 'restaurant_mode', 'supermarket_mode', 'low_stock_alert', 'allow_manual_discount'].includes(key);
  }

  getBool(key: string): boolean {
    return this.settings[key] === 'true';
  }

  setBool(key: string, value: boolean): void {
    this.settings[key] = value ? 'true' : 'false';
  }

  save(): void {
    if (!this.canEdit) return;
    this.settingsService.update({ settings: this.settings }).subscribe({
      next: () => this.snack.success(this.i18n.instant('COMMON.SAVED')),
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  settingLabel(key: string): string {
    const t = this.i18n.instant(`SETTINGS.KEYS.${key}`);
    return t.startsWith('SETTINGS.KEYS.') ? key : t;
  }
}
