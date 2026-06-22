package com.poscashier.modules.pos.dto;

import com.poscashier.modules.pos.entity.PosOrderItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private Long variantId;
    private String productName;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal lineTotal;
    private String notes;
    private String modifiersJson;
    private String kitchenStatus;

    public static OrderItemResponse from(PosOrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .variantId(item.getVariantId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discountAmount(item.getDiscountAmount())
                .taxAmount(item.getTaxAmount())
                .lineTotal(item.getLineTotal())
                .notes(item.getNotes())
                .modifiersJson(item.getModifiersJson())
                .kitchenStatus(item.getKitchenStatus())
                .build();
    }
}
