export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitCost: number;
  receivedQuantity?: number;
  lineTotal?: number;
}

export interface PurchaseOrder {
  id: number;
  branchId: number;
  supplierId?: number;
  status: PurchaseOrderStatus;
  orderDate?: string;
  expectedDate?: string;
  invoiceNo?: string;
  notes?: string;
  totalAmount?: number;
  createdAt?: string;
  createdBy?: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderRequest {
  supplierId?: number;
  status?: PurchaseOrderStatus;
  orderDate?: string;
  expectedDate?: string;
  invoiceNo?: string;
  notes?: string;
  items: { productId: number; quantity: number; unitCost: number }[];
}
