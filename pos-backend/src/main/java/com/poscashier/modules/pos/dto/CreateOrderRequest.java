package com.poscashier.modules.pos.dto;

import com.poscashier.shared.enums.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull
    private Long branchId;

    private Long customerId;

    private Long tableId;

    private OrderType orderType;

    private BigDecimal discountAmount;

    private String notes;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;
}
