import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private stack: string[] = [];
  private resetOnNextNav = false;
  private readonly canGoBackSubject = new BehaviorSubject<boolean>(false);
  readonly canGoBack$ = this.canGoBackSubject.asObservable();

  constructor(private readonly router: Router) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.onNavigate(event.urlAfterRedirects.split('?')[0]);
      });
  }

  markFromMenu(): void {
    this.resetOnNextNav = true;
  }

  canGoBack(): boolean {
    return this.stack.length > 1;
  }

  goBack(location: Location): void {
    if (!this.canGoBack()) return;
    location.back();
  }

  private onNavigate(url: string): void {
    if (this.resetOnNextNav) {
      this.stack = [url];
      this.resetOnNextNav = false;
      this.emit();
      return;
    }
    const existingIndex = this.stack.lastIndexOf(url);
    if (existingIndex >= 0 && existingIndex < this.stack.length - 1) {
      this.stack = this.stack.slice(0, existingIndex + 1);
      this.emit();
      return;
    }
    const last = this.stack[this.stack.length - 1];
    if (last !== url) this.stack.push(url);
    this.emit();
  }

  private emit(): void {
    this.canGoBackSubject.next(this.canGoBack());
  }
}
