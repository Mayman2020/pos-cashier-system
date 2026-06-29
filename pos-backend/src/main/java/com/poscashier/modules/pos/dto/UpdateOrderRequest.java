package com.poscashier.modules.pos.dto;

import com.poscashier.shared.enums.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateOrderRequest {

    private Long customerId;

    private Long tableId;

    private OrderType orderType;

    private BigDecimal discountAmount;

    private String discountCode;

    private Integer loyaltyPointsRedeemed;

    private String notes;

    private List<OrderNoteRequest> orderNotes;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;
}
