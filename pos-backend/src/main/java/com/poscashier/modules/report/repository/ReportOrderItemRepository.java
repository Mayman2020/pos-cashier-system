package com.poscashier.modules.report.repository;

import com.poscashier.modules.pos.entity.PosOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportOrderItemRepository extends JpaRepository<PosOrderItem, Long> {

    @Query("""
            SELECT i.productId, i.productName, SUM(i.quantity), SUM(i.lineTotal)
            FROM PosOrderItem i
            JOIN PosOrder o ON o.id = i.orderId
            WHERE o.status = com.poscashier.shared.enums.OrderStatus.PAID
              AND o.paidAt >= :start AND o.paidAt < :end
              AND (:branchId IS NULL OR o.branchId = :branchId)
            GROUP BY i.productId, i.productName
            ORDER BY SUM(i.lineTotal) DESC
            """)
    List<Object[]> topProducts(@Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end,
                               @Param("branchId") Long branchId);
}
