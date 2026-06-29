package com.poscashier.modules.product.dto;

import com.poscashier.modules.product.entity.ProductVariant;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String sku;
    private String barcode;
    private String name;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private boolean active;

    public static ProductVariantResponse from(ProductVariant v) {
        return ProductVariantResponse.builder()
                .id(v.getId())
                .productId(v.getProductId())
                .sku(v.getSku())
                .barcode(v.getBarcode())
                .name(v.getName())
                .costPrice(v.getCostPrice())
                .sellingPrice(v.getSellingPrice())
                .active(v.isActive())
                .build();
    }
}
