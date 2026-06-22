package com.poscashier.modules.report.service;

import com.poscashier.modules.inventory.dto.InventoryBalanceResponse;
import com.poscashier.modules.inventory.service.InventoryService;
import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.modules.pos.repository.PosOrderRepository;
import com.poscashier.modules.report.dto.*;
import com.poscashier.modules.report.repository.ReportOrderItemRepository;
import com.poscashier.modules.report.repository.ReportPaymentRepository;
import com.poscashier.shared.enums.PaymentMethod;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PosOrderRepository orderRepository;
    private final ReportPaymentRepository reportPaymentRepository;
    private final ReportOrderItemRepository reportOrderItemRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public SalesReportResponse dailySales(LocalDate date, Long branchId) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        return buildSalesReport(date, start, end, branchId);
    }

    @Transactional(readOnly = true)
    public SalesReportResponse monthlySales(int year, int month, Long branchId) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
        return buildSalesReport(ym.atDay(1), start, end, branchId);
    }

    @Transactional(readOnly = true)
    public List<TopProductResponse> topProducts(LocalDate from, LocalDate to, Long branchId, int limit) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        return reportOrderItemRepository.topProducts(start, end, branchId).stream()
                .limit(limit > 0 ? limit : 10)
                .map(row -> TopProductResponse.builder()
                        .productId((Long) row[0])
                        .productName((String) row[1])
                        .quantitySold((BigDecimal) row[2])
                        .totalRevenue((BigDecimal) row[3])
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public ProfitReportResponse profit(int year, int month, Long branchId) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
        List<PosOrder> orders = orderRepository.findPaidOrdersBetween(start, end, branchId);
        BigDecimal revenue = orders.stream()
                .map(PosOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cost = estimateCost(orders);
        return ProfitReportResponse.builder()
                .month(ym)
                .totalRevenue(revenue)
                .totalCost(cost)
                .grossProfit(revenue.subtract(cost))
                .build();
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodReportResponse> paymentMethods(LocalDate from, LocalDate to, Long branchId) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        return reportPaymentRepository.aggregateByPaymentMethod(start, end, branchId).stream()
                .map(row -> PaymentMethodReportResponse.builder()
                        .paymentMethod((PaymentMethod) row[0])
                        .transactionCount((Long) row[1])
                        .totalAmount((BigDecimal) row[2])
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CashierSalesResponse> cashierSales(LocalDate from, LocalDate to, Long branchId) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        List<PosOrder> orders = orderRepository.findPaidOrdersBetween(start, end, branchId);
        Map<Long, List<PosOrder>> grouped = orders.stream()
                .collect(Collectors.groupingBy(PosOrder::getCashierId));
        List<CashierSalesResponse> result = new ArrayList<>();
        grouped.forEach((cashierId, list) -> result.add(CashierSalesResponse.builder()
                .cashierId(cashierId)
                .orderCount(list.size())
                .totalSales(list.stream().map(PosOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                .build()));
        return result;
    }

    @Transactional(readOnly = true)
    public List<BranchSalesResponse> branchSales(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        List<PosOrder> orders = orderRepository.findPaidOrdersBetween(start, end, null);
        Map<Long, List<PosOrder>> grouped = orders.stream()
                .collect(Collectors.groupingBy(PosOrder::getBranchId));
        List<BranchSalesResponse> result = new ArrayList<>();
        grouped.forEach((branchId, list) -> result.add(BranchSalesResponse.builder()
                .branchId(branchId)
                .orderCount(list.size())
                .totalSales(list.stream().map(PosOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                .build()));
        return result;
    }

    @Transactional(readOnly = true)
    public List<InventoryBalanceResponse> lowStock(Long branchId) {
        return inventoryService.lowStock(branchId);
    }

    private SalesReportResponse buildSalesReport(LocalDate label, LocalDateTime start, LocalDateTime end, Long branchId) {
        List<PosOrder> orders = orderRepository.findPaidOrdersBetween(start, end, branchId);
        return SalesReportResponse.builder()
                .date(label)
                .orderCount(orders.size())
                .totalSales(orders.stream().map(PosOrder::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                .totalTax(orders.stream().map(PosOrder::getTaxAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                .totalDiscount(orders.stream().map(PosOrder::getDiscountAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                .build();
    }

    private BigDecimal estimateCost(List<PosOrder> orders) {
        BigDecimal total = BigDecimal.ZERO;
        for (PosOrder order : orders) {
            total = total.add(order.getSubtotal().multiply(new BigDecimal("0.6")));
        }
        return total;
    }
}
