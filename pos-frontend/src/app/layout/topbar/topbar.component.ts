import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService, LangCode } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgFor, MatButtonModule, MatIconModule, MatMenuModule, TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  @Input() sidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(
    readonly i18n: I18nService,
    readonly theme: ThemeService
  ) {}

  switchLang(code: LangCode): void {
    this.i18n.setLang(code).subscribe();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  get currentLangLabel(): string {
    return this.i18n.languages.find((l) => l.code === this.i18n.currentLang)?.nativeLabel ?? this.i18n.currentLang;
  }
}
