package com.poscashier.modules.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BranchSalesResponse {

    private Long branchId;
    private long orderCount;
    private BigDecimal totalSales;
}
