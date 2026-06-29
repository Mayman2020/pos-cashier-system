export type OrderStatus = 'DRAFT' | 'HELD' | 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
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

export interface OrderNote {
  id?: number;
  itemId?: number;
  note: string;
  createdAt?: string;
  createdBy?: string;
}

export interface OrderNoteRequest {
  itemId?: number;
  note: string;
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
  orderNotes?: OrderNote[];
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
  discountCode?: string;
  loyaltyPointsRedeemed?: number;
  notes?: string;
  orderNotes?: OrderNoteRequest[];
  items: OrderItemRequest[];
}

export interface UpdateOrderRequest {
  customerId?: number;
  tableId?: number;
  orderType?: OrderType;
  discountAmount?: number;
  discountCode?: string;
  loyaltyPointsRedeemed?: number;
  notes?: string;
  orderNotes?: OrderNoteRequest[];
  items: OrderItemRequest[];
}

export interface RefundItemRequest {
  orderItemId: number;
  quantity: number;
}

export interface RefundOrderRequest {
  reason?: string;
  refundMethod?: PaymentMethod;
  items?: RefundItemRequest[];
}

export interface PayOrderRequest {
  paymentMethod: PaymentMethod;
  amount: number;
  cashAmount?: number;
  cardAmount?: number;
  referenceNo?: string;
}
