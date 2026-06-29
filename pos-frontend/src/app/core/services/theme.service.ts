import { Injectable, inject, signal } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'pos_theme';
  private readonly overlayContainer = inject(OverlayContainer);
  readonly mode = signal<ThemeMode>(this.initialMode());

  constructor() {
    this.syncDom(this.mode());
  }

  toggle(): void {
    const next: ThemeMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  set(mode: ThemeMode): void {
    this.apply(mode);
  }

  private initialMode(): ThemeMode {
    const saved = localStorage.getItem(this.storageKey);
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  }

  private apply(mode: ThemeMode): void {
    this.mode.set(mode);
    this.syncDom(mode);
    localStorage.setItem(this.storageKey, mode);
  }

  private syncDom(mode: ThemeMode): void {
    const isDark = mode === 'dark';
    document.documentElement.classList.toggle('dark-theme', isDark);
    try {
      this.overlayContainer.getContainerElement().classList.toggle('dark-theme', isDark);
    } catch {
      /* overlay not ready during bootstrap */
    }
  }
}
