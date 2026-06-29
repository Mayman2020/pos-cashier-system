import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  constructor(private readonly api: ApiService) {}

  upload(file: File): Observable<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.api.postForm<{ url: string; filename: string }>(AppConstants.API.FILES, form);
  }
}
