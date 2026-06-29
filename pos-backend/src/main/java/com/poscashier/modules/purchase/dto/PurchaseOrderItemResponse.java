package com.poscashier.modules.purchase.dto;

import com.poscashier.modules.purchase.entity.PurchaseOrderItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PurchaseOrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal receivedQuantity;
    private BigDecimal lineTotal;

    public static PurchaseOrderItemResponse from(PurchaseOrderItem item, String productName) {
        return PurchaseOrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(productName)
                .quantity(item.getQuantity())
                .unitCost(item.getUnitCost())
                .receivedQuantity(item.getReceivedQuantity())
                .lineTotal(item.getUnitCost().multiply(item.getQuantity()))
                .build();
    }
}
