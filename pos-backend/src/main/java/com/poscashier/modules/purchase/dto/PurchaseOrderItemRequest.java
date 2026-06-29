package com.poscashier.modules.purchase.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseOrderItemRequest {

    @NotNull
    private Long productId;

    @NotNull
    private BigDecimal quantity;

    @NotNull
    private BigDecimal unitCost;
}
