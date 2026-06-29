package com.poscashier.modules.customer.dto;

import com.poscashier.modules.customer.entity.LoyaltyTransaction;
import com.poscashier.shared.enums.LoyaltyTransactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LoyaltyTransactionResponse {

    private Long id;
    private Long customerId;
    private Long orderId;
    private LoyaltyTransactionType transactionType;
    private int points;
    private String notes;
    private LocalDateTime createdAt;
    private String createdBy;

    public static LoyaltyTransactionResponse from(LoyaltyTransaction t) {
        return LoyaltyTransactionResponse.builder()
                .id(t.getId())
                .customerId(t.getCustomerId())
                .orderId(t.getOrderId())
                .transactionType(t.getTransactionType())
                .points(t.getPoints())
                .notes(t.getNotes())
                .createdAt(t.getCreatedAt())
                .createdBy(t.getCreatedBy())
                .build();
    }
}
