package com.poscashier.modules.pos.dto;

import com.poscashier.shared.enums.PaymentMethod;
import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

@Data
public class RefundOrderRequest {

    private String reason;

    private PaymentMethod refundMethod;

    @Valid
    private List<RefundItemRequest> items;
}
