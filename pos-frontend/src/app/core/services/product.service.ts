import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { SpringPage } from '../models/api-response.model';
import { Product, ProductRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly api: ApiService) {}

  list(page = 0, size = 20, q?: string): Observable<SpringPage<Product>> {
    return this.api.get<SpringPage<Product>>(AppConstants.API.PRODUCTS, { page, size, q });
  }

  getById(id: number): Observable<Product> {
    return this.api.get<Product>(AppConstants.API.PRODUCT_BY_ID(id));
  }

  create(body: ProductRequest): Observable<Product> {
    return this.api.post<Product>(AppConstants.API.PRODUCTS, body);
  }

  update(id: number, body: ProductRequest): Observable<Product> {
    return this.api.put<Product>(AppConstants.API.PRODUCT_BY_ID(id), body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(AppConstants.API.PRODUCT_BY_ID(id));
  }
}
