package com.poscashier.modules.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TopProductResponse {

    private Long productId;
    private String productName;
    private BigDecimal quantitySold;
    private BigDecimal totalRevenue;
}
