package com.poscashier.modules.pos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundItemRequest {

    @NotNull
    private Long orderItemId;

    @NotNull
    @Positive
    private BigDecimal quantity;
}
