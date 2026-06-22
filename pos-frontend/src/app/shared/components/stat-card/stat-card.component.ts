import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat-card">
      <div class="stat-icon"><span class="material-icons">{{ icon }}</span></div>
      <div class="stat-content">
        <div class="stat-label">{{ label }}</div>
        <div class="stat-value">{{ value }}</div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input() icon = 'info';
  @Input() value: string | number = 0;
  @Input() label = '';
}
