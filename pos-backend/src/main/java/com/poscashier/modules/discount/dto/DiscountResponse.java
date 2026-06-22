package com.poscashier.modules.discount.dto;

import com.poscashier.modules.discount.entity.Discount;
import com.poscashier.shared.enums.DiscountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DiscountResponse {

    private Long id;
    private String code;
    private String name;
    private DiscountType discountType;
    private BigDecimal value;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DiscountResponse from(Discount discount) {
        return DiscountResponse.builder()
                .id(discount.getId())
                .code(discount.getCode())
                .name(discount.getName())
                .discountType(discount.getDiscountType())
                .value(discount.getValue())
                .active(discount.isActive())
                .createdAt(discount.getCreatedAt())
                .updatedAt(discount.getUpdatedAt())
                .build();
    }
}
