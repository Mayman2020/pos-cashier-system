package com.poscashier.modules.purchase.dto;

import com.poscashier.shared.enums.PurchaseOrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseOrderRequest {

    private Long supplierId;
    private PurchaseOrderStatus status;
    private LocalDate orderDate;
    private LocalDate expectedDate;
    private String invoiceNo;
    private String notes;

    @NotEmpty
    @Valid
    private List<PurchaseOrderItemRequest> items;
}
