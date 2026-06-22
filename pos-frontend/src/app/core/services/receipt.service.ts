import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { Receipt } from '../models/receipt.model';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  constructor(private readonly api: ApiService) {}

  get(orderId: number): Observable<Receipt> {
    return this.api.get<Receipt>(AppConstants.API.RECEIPT(orderId));
  }
}
