package com.poscashier.modules.dashboard.dto;

import com.poscashier.modules.inventory.dto.InventoryBalanceResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardSummaryResponse {

    private long todayOrders;
    private BigDecimal todaySales;
    private long openShifts;
    private long lowStockItems;
    private long activeProducts;
    private long activeCustomers;
    private List<InventoryBalanceResponse> lowStockPreview;
}
