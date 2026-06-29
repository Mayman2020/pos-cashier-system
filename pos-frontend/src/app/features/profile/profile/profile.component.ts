import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SnackService } from '../../../core/services/snack.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  loading = true;
  changingPassword = false;
  highlightPassword = false;
  username = '';
  fullName = '';
  email = '';
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: UserProfileService,
    private readonly auth: AuthService,
    private readonly snack: SnackService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('changePassword') === '1') {
      this.highlightPassword = true;
    }
    this.profileService.getMyProfile().subscribe({
      next: (user) => {
        this.username = user?.username ?? '';
        this.fullName = user?.fullName ?? '';
        this.email = user?.email ?? '';
        this.loading = false;
      },
      error: (error: Error) => {
        this.snack.error(error.message);
        this.loading = false;
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.snack.error('Password confirmation does not match');
      return;
    }
    this.changingPassword = true;
    this.profileService
      .changeMyPassword({
        currentPassword: value.currentPassword ?? '',
        newPassword: value.newPassword ?? '',
      })
      .subscribe({
        next: () => {
          this.auth.clearMustChangePassword();
          this.highlightPassword = false;
          this.snack.success('Saved');
          this.passwordForm.reset();
          this.changingPassword = false;
        },
        error: (error: Error) => {
          this.snack.error(error.message);
          this.changingPassword = false;
        },
      });
  }
}
