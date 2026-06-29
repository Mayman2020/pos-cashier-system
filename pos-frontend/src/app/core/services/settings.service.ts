import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SettingsResponse, SettingsUpdateRequest } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private readonly api: ApiService) {}

  get(): Observable<SettingsResponse> {
    return this.api.get<SettingsResponse>(AppConstants.API.SETTINGS);
  }

  getPos(): Observable<SettingsResponse> {
    return this.api.get<SettingsResponse>(AppConstants.API.SETTINGS_POS);
  }

  update(body: SettingsUpdateRequest): Observable<SettingsResponse> {
    return this.api.put<SettingsResponse>(AppConstants.API.SETTINGS, body);
  }
}
