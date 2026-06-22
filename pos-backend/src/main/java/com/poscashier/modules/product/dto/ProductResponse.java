package com.poscashier.modules.product.dto;

import com.poscashier.modules.product.entity.Product;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {

    private Long id;
    private String sku;
    private String barcode;
    private String name;
    private String description;
    private Long categoryId;
    private Long unitId;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal taxRate;
    private boolean trackStock;
    private BigDecimal lowStockThreshold;
    private boolean active;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse from(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategoryId())
                .unitId(product.getUnitId())
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .taxRate(product.getTaxRate())
                .trackStock(product.isTrackStock())
                .lowStockThreshold(product.getLowStockThreshold())
                .active(product.isActive())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
