package com.poscashier.modules.pos.dto;

import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.modules.pos.entity.PosOrderItem;
import com.poscashier.shared.enums.OrderStatus;
import com.poscashier.shared.enums.OrderType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long branchId;
    private Long shiftId;
    private Long cashierId;
    private Long customerId;
    private Long tableId;
    private OrderType orderType;
    private OrderStatus status;
    private String kitchenStatus;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String notes;
    private LocalDateTime heldAt;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private List<OrderNoteResponse> orderNotes;

    public static OrderResponse from(PosOrder order, List<PosOrderItem> items) {
        return from(order, items, List.of());
    }

    public static OrderResponse from(PosOrder order, List<PosOrderItem> items, List<com.poscashier.modules.pos.entity.OrderNote> notes) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .branchId(order.getBranchId())
                .shiftId(order.getShiftId())
                .cashierId(order.getCashierId())
                .customerId(order.getCustomerId())
                .tableId(order.getTableId())
                .orderType(order.getOrderType())
                .status(order.getStatus())
                .kitchenStatus(order.getKitchenStatus())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .paidAmount(order.getPaidAmount())
                .notes(order.getNotes())
                .heldAt(order.getHeldAt())
                .paidAt(order.getPaidAt())
                .cancelledAt(order.getCancelledAt())
                .createdAt(order.getCreatedAt())
                .items(items.stream().map(OrderItemResponse::from).toList())
                .orderNotes(notes.stream().map(OrderNoteResponse::from).toList())
                .build();
    }
}
