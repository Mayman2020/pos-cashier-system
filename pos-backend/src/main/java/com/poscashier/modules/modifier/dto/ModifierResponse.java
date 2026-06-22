package com.poscashier.modules.modifier.dto;

import com.poscashier.modules.modifier.entity.ProductModifier;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ModifierResponse {

    private Long id;
    private Long productId;
    private String name;
    private BigDecimal priceAdjustment;
    private String modifierGroup;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ModifierResponse from(ProductModifier modifier) {
        return ModifierResponse.builder()
                .id(modifier.getId())
                .productId(modifier.getProductId())
                .name(modifier.getName())
                .priceAdjustment(modifier.getPriceAdjustment())
                .modifierGroup(modifier.getModifierGroup())
                .active(modifier.isActive())
                .createdAt(modifier.getCreatedAt())
                .updatedAt(modifier.getUpdatedAt())
                .build();
    }
}
