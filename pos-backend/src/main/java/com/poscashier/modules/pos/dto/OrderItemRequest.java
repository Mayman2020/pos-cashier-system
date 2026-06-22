package com.poscashier.modules.pos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemRequest {

    @NotNull
    private Long productId;

    private Long variantId;

    @NotNull
    @Positive
    private BigDecimal quantity;

    private BigDecimal discountAmount;

    private String notes;

    private String modifiersJson;
}
