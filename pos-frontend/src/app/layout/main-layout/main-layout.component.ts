import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PosMobileBottomNavComponent } from '../../shared/pos/mobile-bottom-nav/mobile-bottom-nav.component';
import { LoadingService } from '../../core/services/loading.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, NgClass, NgIf, SidebarComponent, TopbarComponent,
    LoadingSpinnerComponent, PosMobileBottomNavComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  isPosRoute = false;
  private routeSub?: Subscription;

  constructor(
    readonly i18n: I18nService,
    readonly loading: LoadingService,
    private readonly theme: ThemeService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.theme.set(this.theme.mode());
    this.syncPosRoute(this.router.url);
    this.routeSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncPosRoute(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  get lang(): 'ar' | 'en' {
    return this.i18n.currentLang;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private syncPosRoute(url: string): void {
    this.isPosRoute = url.includes('/admin/pos');
  }
}
