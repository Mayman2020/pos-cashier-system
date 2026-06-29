export interface InventoryBalance {
  id: number;
  branchId: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  lowStockThreshold?: number;
  updatedAt?: string;
}

export interface StockInRequest {
  branchId: number;
  productId: number;
  quantity: number;
  supplierId?: number;
  invoiceNo?: string;
  invoiceDate?: string;
  notes?: string;
}

export interface StockAvailability {
  productId: number;
  branchId: number;
  available: number;
  trackStock: boolean;
  lowStock: boolean;
}

export interface StockAdjustRequest {
  branchId: number;
  productId: number;
  quantity: number;
  notes?: string;
}

export interface StockTransferRequest {
  fromBranchId: number;
  toBranchId: number;
  productId: number;
  quantity: number;
  notes?: string;
}

export interface StockMovement {
  id: number;
  branchId: number;
  productId: number;
  productName?: string;
  movementType?: string;
  quantity: number;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
}
