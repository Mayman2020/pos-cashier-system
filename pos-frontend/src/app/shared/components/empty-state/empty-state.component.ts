import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, TranslateModule],
  template: `
    <div class="app-empty-state">
      <span class="material-icons empty-icon">{{ icon }}</span>
      <h4>{{ title | translate }}</h4>
      <p *ngIf="message">{{ message | translate }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'COMMON.NO_DATA';
  @Input() message = '';
}
