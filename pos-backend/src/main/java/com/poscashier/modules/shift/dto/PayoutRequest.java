package com.poscashier.modules.shift.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PayoutRequest {

    @NotNull
    @Positive
    private BigDecimal amount;

    private String notes;
}
