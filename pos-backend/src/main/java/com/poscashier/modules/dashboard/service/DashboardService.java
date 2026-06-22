package com.poscashier.modules.dashboard.service;

import com.poscashier.modules.customer.repository.CustomerRepository;
import com.poscashier.modules.dashboard.dto.DashboardSummaryResponse;
import com.poscashier.modules.inventory.service.InventoryService;
import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.modules.pos.repository.PosOrderRepository;
import com.poscashier.modules.product.repository.ProductRepository;
import com.poscashier.modules.shift.repository.ShiftRepository;
import com.poscashier.shared.enums.ShiftStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PosOrderRepository orderRepository;
    private final ShiftRepository shiftRepository;
    private final InventoryService inventoryService;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary(Long branchId) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        List<PosOrder> todayOrders = orderRepository.findPaidOrdersBetween(start, end, branchId);
        BigDecimal todaySales = todayOrders.stream()
                .map(PosOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long openShifts = branchId != null
                ? shiftRepository.search(branchId, null, ShiftStatus.OPEN, org.springframework.data.domain.Pageable.unpaged()).getTotalElements()
                : shiftRepository.search(null, null, ShiftStatus.OPEN, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        var lowStock = inventoryService.lowStock(branchId);

        return DashboardSummaryResponse.builder()
                .todayOrders(todayOrders.size())
                .todaySales(todaySales)
                .openShifts(openShifts)
                .lowStockItems(lowStock.size())
                .activeProducts(productRepository.findAll().stream().filter(p -> p.isActive()).count())
                .activeCustomers(customerRepository.findAll().stream().filter(c -> c.isActive()).count())
                .lowStockPreview(lowStock.stream().limit(10).toList())
                .build();
    }
}
