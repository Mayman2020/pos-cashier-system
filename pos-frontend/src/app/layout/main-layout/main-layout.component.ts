import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { LoadingService } from '../../core/services/loading.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NgClass, NgIf, SidebarComponent, TopbarComponent, LoadingSpinnerComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  sidebarCollapsed = false;

  constructor(
    readonly i18n: I18nService,
    readonly loading: LoadingService,
    private readonly theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.theme.set(this.theme.mode());
  }

  get lang(): 'ar' | 'en' {
    return this.i18n.currentLang;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
