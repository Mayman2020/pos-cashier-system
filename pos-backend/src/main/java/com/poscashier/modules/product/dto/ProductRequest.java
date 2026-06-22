package com.poscashier.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank
    @Size(max = 50)
    private String sku;

    @Size(max = 100)
    private String barcode;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 1000)
    private String description;

    private Long categoryId;

    private Long unitId;

    @NotNull
    private BigDecimal costPrice;

    @NotNull
    private BigDecimal sellingPrice;

    private BigDecimal taxRate;

    private Boolean trackStock;

    private BigDecimal lowStockThreshold;

    private Boolean active;

    @Size(max = 500)
    private String imageUrl;
}
