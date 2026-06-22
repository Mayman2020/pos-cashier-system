export interface SalesReport {
  totalOrders?: number;
  orderCount?: number;
  totalSales?: number;
  totalTax?: number;
  totalDiscount?: number;
  averageOrderValue?: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  totalSales: number;
}

export interface ProfitReport {
  totalRevenue?: number;
  totalCost?: number;
  grossProfit?: number;
  profitMargin?: number;
}

export interface PaymentMethodReport {
  paymentMethod: string;
  transactionCount?: number;
  count?: number;
  totalAmount: number;
}

export interface CashierSalesReport {
  cashierId: number;
  orderCount: number;
  totalSales: number;
}

export interface BranchSalesReport {
  branchId: number;
  orderCount: number;
  totalSales: number;
}

export interface LowStockReportItem {
  productId?: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  lowStockThreshold?: number;
}
