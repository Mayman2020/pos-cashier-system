import { InventoryBalance } from './inventory.model';

export interface DashboardSummary {
  todayOrders: number;
  todaySales: number;
  todayCashSales?: number;
  todayCardSales?: number;
  openShifts: number;
  heldOrders?: number;
  lowStockItems: number;
  activeProducts: number;
  activeCustomers: number;
  lowStockPreview?: InventoryBalance[];
}
