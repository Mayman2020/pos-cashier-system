import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionAction } from '../../core/models/user.model';
import { PermissionService } from '../../core/services/permission.service';

@Directive({ selector: '[appCan]', standalone: true })
export class HasPermissionDirective implements OnChanges {
  @Input('appCan') module!: string;
  @Input('appCanAction') action: PermissionAction = 'view';
  private hasView = false;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly permissions: PermissionService
  ) {}

  ngOnChanges(): void {
    this.updateView();
  }

  private updateView(): void {
    const allowed = this.permissions.can(this.module, this.action);
    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
