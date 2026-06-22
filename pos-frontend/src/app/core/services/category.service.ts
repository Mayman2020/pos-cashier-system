import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { Category, CategoryRequest } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 50, q?: string): Observable<SpringPage<Category>> {
    return this.api.get<SpringPage<Category>>(AppConstants.API.CATEGORIES, { page, size, q });
  }

  getById(id: number): Observable<Category> {
    return this.api.get<Category>(AppConstants.API.CATEGORY_BY_ID(id));
  }

  create(body: CategoryRequest): Observable<Category> {
    return this.api.post<Category>(AppConstants.API.CATEGORIES, body);
  }

  update(id: number, body: CategoryRequest): Observable<Category> {
    return this.api.put<Category>(AppConstants.API.CATEGORY_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.CATEGORY_BY_ID(id));
  }
}
