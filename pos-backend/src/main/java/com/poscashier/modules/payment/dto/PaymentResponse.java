package com.poscashier.modules.payment.dto;

import com.poscashier.modules.payment.entity.Payment;
import com.poscashier.shared.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {

    private Long id;
    private Long orderId;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private BigDecimal cashAmount;
    private BigDecimal cardAmount;
    private String referenceNo;
    private LocalDateTime paidAt;

    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .cashAmount(payment.getCashAmount())
                .cardAmount(payment.getCardAmount())
                .referenceNo(payment.getReferenceNo())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
