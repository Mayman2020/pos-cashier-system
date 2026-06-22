package com.poscashier.modules.inventory.dto;

import com.poscashier.modules.inventory.entity.InventoryBalance;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class InventoryBalanceResponse {

    private Long id;
    private Long branchId;
    private Long productId;
    private String productName;
    private String productSku;
    private BigDecimal quantity;
    private BigDecimal lowStockThreshold;
    private LocalDateTime updatedAt;

    public static InventoryBalanceResponse from(InventoryBalance balance, String productName, String productSku,
                                                BigDecimal lowStockThreshold) {
        return InventoryBalanceResponse.builder()
                .id(balance.getId())
                .branchId(balance.getBranchId())
                .productId(balance.getProductId())
                .productName(productName)
                .productSku(productSku)
                .quantity(balance.getQuantity())
                .lowStockThreshold(lowStockThreshold)
                .updatedAt(balance.getUpdatedAt())
                .build();
    }
}
