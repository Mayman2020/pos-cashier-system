import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

const BRANCH_KEY = 'pos_selected_branch';

@Injectable({ providedIn: 'root' })
export class BranchContextService {
  readonly selectedBranchId = signal<number | null>(null);
  private readonly branchChange = new Subject<number>();
  readonly branchChanged$ = this.branchChange.asObservable();

  constructor(private readonly auth: AuthService) {
    const stored = localStorage.getItem(BRANCH_KEY);
    if (stored) {
      this.selectedBranchId.set(Number(stored));
    }
  }

  getBranchId(): number {
    const user = this.auth.getCurrentUser();
    if (this.auth.isAdmin()) {
      const selected = this.selectedBranchId();
      if (selected != null) return selected;
    }
    return user?.branchId ?? 1;
  }

  setBranchId(id: number): void {
    this.selectedBranchId.set(id);
    localStorage.setItem(BRANCH_KEY, String(id));
    this.branchChange.next(id);
  }

  canSwitchBranch(): boolean {
    return this.auth.isAdmin();
  }
}
