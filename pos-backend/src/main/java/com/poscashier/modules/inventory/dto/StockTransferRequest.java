package com.poscashier.modules.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockTransferRequest {

    @NotNull
    private Long fromBranchId;

    @NotNull
    private Long toBranchId;

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private BigDecimal quantity;

    private String notes;
}
