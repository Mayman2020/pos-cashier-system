package com.poscashier.modules.pos.dto;

import com.poscashier.shared.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PayOrderRequest {

    @NotNull
    private PaymentMethod paymentMethod;

    @NotNull
    private BigDecimal amount;

    private BigDecimal cashAmount;

    private BigDecimal cardAmount;

    private String referenceNo;
}
