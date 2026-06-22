package com.poscashier.modules.discount.dto;

import com.poscashier.shared.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DiscountRequest {

    @NotBlank
    @Size(max = 30)
    private String code;

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotNull
    private DiscountType discountType;

    @NotNull
    private BigDecimal value;

    private Boolean active;
}
