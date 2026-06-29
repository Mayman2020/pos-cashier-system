package com.poscashier.modules.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class StockInRequest {

    @NotNull
    private Long branchId;

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private BigDecimal quantity;

    private Long supplierId;

    private String invoiceNo;

    private LocalDate invoiceDate;

    private String notes;
}
