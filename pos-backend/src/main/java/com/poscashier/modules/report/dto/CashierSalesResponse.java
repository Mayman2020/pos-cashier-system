package com.poscashier.modules.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CashierSalesResponse {

    private Long cashierId;
    private long orderCount;
    private BigDecimal totalSales;
}
