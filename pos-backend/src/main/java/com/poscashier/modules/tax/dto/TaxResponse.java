package com.poscashier.modules.tax.dto;

import com.poscashier.modules.tax.entity.Tax;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TaxResponse {

    private Long id;
    private String code;
    private String name;
    private BigDecimal rate;
    private boolean defaultTax;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaxResponse from(Tax tax) {
        return TaxResponse.builder()
                .id(tax.getId())
                .code(tax.getCode())
                .name(tax.getName())
                .rate(tax.getRate())
                .defaultTax(tax.isDefaultTax())
                .active(tax.isActive())
                .createdAt(tax.getCreatedAt())
                .updatedAt(tax.getUpdatedAt())
                .build();
    }
}
