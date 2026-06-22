package com.poscashier.modules.modifier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ModifierRequest {

    private Long productId;

    @NotBlank
    @Size(max = 150)
    private String name;

    private BigDecimal priceAdjustment;

    @Size(max = 100)
    private String modifierGroup;

    private Boolean active;
}
