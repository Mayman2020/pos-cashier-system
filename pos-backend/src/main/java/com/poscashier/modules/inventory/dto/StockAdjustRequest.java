package com.poscashier.modules.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockAdjustRequest {

    @NotNull
    private Long branchId;

    @NotNull
    private Long productId;

    @NotNull
    private BigDecimal quantity;

    private String notes;
}
