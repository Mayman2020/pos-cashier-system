package com.poscashier.modules.payment.repository;

import com.poscashier.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderId(Long orderId);

    List<Payment> findByOrderIdAndRefundFalse(Long orderId);

    @Query("""
            SELECT COALESCE(SUM(
                CASE
                    WHEN p.paymentMethod = com.poscashier.shared.enums.PaymentMethod.CASH THEN p.amount
                    WHEN p.paymentMethod = com.poscashier.shared.enums.PaymentMethod.MIXED THEN COALESCE(p.cashAmount, 0)
                    ELSE 0
                END
            ), 0)
            FROM Payment p
            JOIN PosOrder o ON p.orderId = o.id
            WHERE p.refund = false
              AND o.paidAt >= :start AND o.paidAt < :end
              AND (:branchId IS NULL OR o.branchId = :branchId)
            """)
    BigDecimal sumTodayCash(@Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end,
                            @Param("branchId") Long branchId);

    @Query("""
            SELECT COALESCE(SUM(
                CASE
                    WHEN p.paymentMethod = com.poscashier.shared.enums.PaymentMethod.CARD
                         OR p.paymentMethod = com.poscashier.shared.enums.PaymentMethod.OTHER THEN p.amount
                    WHEN p.paymentMethod = com.poscashier.shared.enums.PaymentMethod.MIXED THEN COALESCE(p.cardAmount, 0)
                    ELSE 0
                END
            ), 0)
            FROM Payment p
            JOIN PosOrder o ON p.orderId = o.id
            WHERE p.refund = false
              AND o.paidAt >= :start AND o.paidAt < :end
              AND (:branchId IS NULL OR o.branchId = :branchId)
            """)
    BigDecimal sumTodayCard(@Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end,
                            @Param("branchId") Long branchId);

    @Query("""
            SELECT COALESCE(SUM(ABS(p.amount)), 0)
            FROM Payment p
            JOIN PosOrder o ON p.orderId = o.id
            WHERE p.refund = true
              AND p.paidAt >= :start AND p.paidAt < :end
              AND (:branchId IS NULL OR o.branchId = :branchId)
            """)
    BigDecimal sumTodayRefunds(@Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end,
                               @Param("branchId") Long branchId);
}
