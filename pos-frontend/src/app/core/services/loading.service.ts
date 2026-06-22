import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly counter = signal(0);

  readonly active = this.counter.asReadonly();

  show(): void {
    this.counter.update((c) => c + 1);
  }

  hide(): void {
    this.counter.update((c) => Math.max(0, c - 1));
  }
}
