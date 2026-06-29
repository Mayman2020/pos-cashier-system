import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService, LangCode } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { BranchContextService } from '../../core/services/branch-context.service';
import { BranchService } from '../../core/services/branch.service';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatSelectModule, TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  branches: Branch[] = [];
  selectedBranchId: number | null = null;

  constructor(
    readonly i18n: I18nService,
    readonly theme: ThemeService,
    readonly branchContext: BranchContextService,
    private readonly branchService: BranchService
  ) {}

  ngOnInit(): void {
    if (this.branchContext.canSwitchBranch()) {
      this.branchService.list(0, 50).subscribe({
        next: (page) => {
          this.branches = page.content;
          this.selectedBranchId = this.branchContext.getBranchId();
        },
      });
    }
  }

  onBranchChange(id: number): void {
    this.branchContext.setBranchId(id);
    this.selectedBranchId = id;
  }

  switchLang(code: LangCode): void {
    this.i18n.setLang(code).subscribe();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  get currentLangLabel(): string {
    return this.i18n.languages.find((l) => l.code === this.i18n.currentLang)?.nativeLabel ?? this.i18n.currentLang;
  }

  get currentLangFlag(): string {
    return this.flagFor(this.i18n.currentLang);
  }

  flagFor(code: LangCode): string {
    return code === 'ar' ? '🇸🇦' : '🇬🇧';
  }
}
