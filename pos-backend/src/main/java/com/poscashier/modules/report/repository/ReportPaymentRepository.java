package com.poscashier.modules.report.repository;

import com.poscashier.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportPaymentRepository extends JpaRepository<Payment, Long> {

    @Query("""
            SELECT p.paymentMethod, COUNT(p), SUM(p.amount)
            FROM Payment p, PosOrder o
            WHERE p.orderId = o.id
              AND p.paidAt >= :start AND p.paidAt < :end
              AND (:branchId IS NULL OR o.branchId = :branchId)
            GROUP BY p.paymentMethod
            """)
    List<Object[]> aggregateByPaymentMethod(@Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end,
                                            @Param("branchId") Long branchId);
}
