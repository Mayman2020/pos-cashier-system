package com.poscashier.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequest {

    @NotBlank
    @Size(max = 50)
    private String sku;

    @Size(max = 100)
    private String barcode;

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotNull
    private BigDecimal costPrice;

    @NotNull
    private BigDecimal sellingPrice;

    private Boolean active;
}
