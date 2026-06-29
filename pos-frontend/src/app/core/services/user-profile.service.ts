import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { CurrentUser } from '../models/user.model';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private readonly api: ApiService) {}

  getMyProfile(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>(AppConstants.API.USERS_ME);
  }

  changeMyPassword(payload: ChangePasswordRequest): Observable<string> {
    return this.api.post<string>(AppConstants.API.USERS_ME_CHANGE_PASSWORD, payload);
  }
}
