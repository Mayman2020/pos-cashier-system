import { PosOrder } from './order.model';

export interface PaymentRecord {
  id: number;
  orderId: number;
  paymentMethod: string;
  amount: number;
  cashAmount?: number;
  cardAmount?: number;
  referenceNo?: string;
  paidAt?: string;
}

export interface Receipt {
  order: PosOrder;
  payments: PaymentRecord[];
  receiptNumber: string;
  printedAt: string;
}
