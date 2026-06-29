package com.poscashier.modules.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    private String notes;
}
