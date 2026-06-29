export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface Shift {
  id: number;
  branchId: number;
  cashierId?: number;
  status: ShiftStatus;
  openedAt?: string;
  closedAt?: string;
  openingCash?: number;
  expectedCash?: number;
  actualCash?: number;
  cashDifference?: number;
  totalSales?: number;
  totalCashSales?: number;
  totalCardSales?: number;
  totalRefundsCash?: number;
  totalRefundsCard?: number;
  totalPayouts?: number;
  notes?: string;
}

export interface OpenShiftRequest {
  branchId: number;
  openingCash?: number;
}

export interface CloseShiftRequest {
  actualCash: number;
  notes?: string;
  forceClose?: boolean;
}
