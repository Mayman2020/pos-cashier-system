export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface RestaurantTable {
  id: number;
  branchId: number;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
}

export interface TableRequest {
  branchId: number;
  tableNumber: string;
  capacity?: number;
  status?: TableStatus;
}
