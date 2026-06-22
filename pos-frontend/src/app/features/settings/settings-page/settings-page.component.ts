import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    NgIf, NgFor, KeyValuePipe, FormsModule, TranslateModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    PageHeaderComponent, LoadingSpinnerComponent,
  ],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent implements OnInit {
  loading = true;
  settings: Record<string, string> = {};
  keys: string[] = [];

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
        this.keys = Object.keys(this.settings);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  get canEdit(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  save(): void {
    if (!this.canEdit) return;
    this.settingsService.update({ settings: this.settings }).subscribe({
      next: () => this.snack.success(this.i18n.instant('COMMON.SAVED')),
      error: (e: Error) => this.snack.errorFrom(e),
    });
  }

  settingLabel(key: string): string {
    const i18nKey = `SETTINGS.KEY_${key.toUpperCase()}`;
    const translated = this.i18n.instant(i18nKey);
    return translated !== i18nKey ? translated : key;
  }
}
