import { InventoryBalance } from './inventory.model';

export interface DashboardSummary {
  todayOrders: number;
  todaySales: number;
  openShifts: number;
  lowStockItems: number;
  activeProducts: number;
  activeCustomers: number;
  lowStockPreview?: InventoryBalance[];
}
