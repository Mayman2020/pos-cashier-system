import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-wrap" [class.loading-contained]="contained">
      <mat-spinner diameter="48"></mat-spinner>
    </div>
  `,
  styles: [`:host { display: contents; }`],
})
export class LoadingSpinnerComponent {
  @Input() contained = false;
}
