package com.poscashier.modules.purchase.dto;

import com.poscashier.modules.purchase.entity.PurchaseOrder;
import com.poscashier.shared.enums.PurchaseOrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PurchaseOrderResponse {

    private Long id;
    private Long branchId;
    private Long supplierId;
    private PurchaseOrderStatus status;
    private LocalDate orderDate;
    private LocalDate expectedDate;
    private String invoiceNo;
    private String notes;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private String createdBy;
    private List<PurchaseOrderItemResponse> items;

    public static PurchaseOrderResponse from(PurchaseOrder po, List<PurchaseOrderItemResponse> items) {
        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .branchId(po.getBranchId())
                .supplierId(po.getSupplierId())
                .status(po.getStatus())
                .orderDate(po.getOrderDate())
                .expectedDate(po.getExpectedDate())
                .invoiceNo(po.getInvoiceNo())
                .notes(po.getNotes())
                .totalAmount(po.getTotalAmount())
                .createdAt(po.getCreatedAt())
                .createdBy(po.getCreatedBy())
                .items(items)
                .build();
    }
}
