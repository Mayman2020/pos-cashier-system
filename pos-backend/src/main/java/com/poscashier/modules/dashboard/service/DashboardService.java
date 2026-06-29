package com.poscashier.modules.dashboard.service;

import com.poscashier.modules.customer.repository.CustomerRepository;
import com.poscashier.modules.dashboard.dto.DashboardSummaryResponse;
import com.poscashier.modules.inventory.service.InventoryService;
import com.poscashier.modules.payment.repository.PaymentRepository;
import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.modules.pos.repository.PosOrderRepository;
import com.poscashier.modules.product.repository.ProductRepository;
import com.poscashier.modules.shift.repository.ShiftRepository;
import com.poscashier.shared.enums.ShiftStatus;
import com.poscashier.shared.util.BranchContext;
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
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary(Long branchId) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        List<PosOrder> todayOrders = orderRepository.findPaidOrdersBetween(start, end, resolved);
        BigDecimal grossSales = todayOrders.stream()
                .map(PosOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal todayRefunds = paymentRepository.sumTodayRefunds(start, end, resolved);
        BigDecimal todaySales = grossSales.subtract(todayRefunds).max(BigDecimal.ZERO);

        long openShifts = shiftRepository.search(resolved, null, ShiftStatus.OPEN,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        var lowStock = inventoryService.lowStock(resolved);

        return DashboardSummaryResponse.builder()
                .todayOrders(todayOrders.size())
                .todaySales(todaySales)
                .todayCashSales(paymentRepository.sumTodayCash(start, end, resolved))
                .todayCardSales(paymentRepository.sumTodayCard(start, end, resolved))
                .openShifts(openShifts)
                .heldOrders(orderRepository.countHeldOrders(resolved))
                .lowStockItems(lowStock.size())
                .activeProducts(productRepository.findAll().stream().filter(p -> p.isActive()).count())
                .activeCustomers(customerRepository.findAll().stream().filter(c -> c.isActive()).count())
                .lowStockPreview(lowStock.stream().limit(10).toList())
                .build();
    }
}
