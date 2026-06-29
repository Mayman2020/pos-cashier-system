package com.poscashier.modules.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class StockAvailabilityResponse {

    private Long productId;
    private Long branchId;
    private BigDecimal available;
    private boolean trackStock;
    private boolean lowStock;
}
