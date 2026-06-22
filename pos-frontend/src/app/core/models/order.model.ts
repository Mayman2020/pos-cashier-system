export type OrderStatus = 'DRAFT' | 'HELD' | 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
export type OrderType = 'RETAIL' | 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED' | 'OTHER';

export type KitchenStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';

export interface OrderItem {
  id?: number;
  productId: number;
  productName?: string;
  variantId?: number;
  quantity: number;
  unitPrice?: number;
  discountAmount?: number;
  taxAmount?: number;
  lineTotal?: number;
  notes?: string;
  modifiersJson?: string;
  kitchenStatus?: KitchenStatus;
}

export interface PosOrder {
  id: number;
  orderNumber?: string;
  branchId?: number;
  shiftId?: number;
  cashierId?: number;
  customerId?: number;
  tableId?: number;
  orderType?: OrderType;
  status: OrderStatus;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  notes?: string;
  heldAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  kitchenStatus?: KitchenStatus;
  items?: OrderItem[];
}

export interface OrderItemRequest {
  productId: number;
  variantId?: number;
  quantity: number;
  discountAmount?: number;
  notes?: string;
  modifiersJson?: string;
}

export interface CreateOrderRequest {
  branchId: number;
  customerId?: number;
  tableId?: number;
  orderType?: OrderType;
  discountAmount?: number;
  notes?: string;
  items: OrderItemRequest[];
}

export interface UpdateOrderRequest {
  customerId?: number;
  tableId?: number;
  orderType?: OrderType;
  discountAmount?: number;
  notes?: string;
  items: OrderItemRequest[];
}

export interface PayOrderRequest {
  paymentMethod: PaymentMethod;
  amount: number;
  cashAmount?: number;
  cardAmount?: number;
  referenceNo?: string;
}
