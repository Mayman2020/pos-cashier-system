package com.poscashier.modules.pos.repository;

import com.poscashier.modules.pos.entity.PosOrder;
import com.poscashier.shared.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PosOrderRepository extends JpaRepository<PosOrder, Long> {

    Optional<PosOrder> findByOrderNumber(String orderNumber);

    @Query("""
            SELECT o FROM PosOrder o
            WHERE (:branchId IS NULL OR o.branchId = :branchId)
              AND (:status IS NULL OR o.status = :status)
              AND LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY o.createdAt DESC
            """)
    Page<PosOrder> search(@Param("branchId") Long branchId,
                          @Param("status") OrderStatus status,
                          @Param("q") String q,
                          Pageable pageable);

    @Query("""
            SELECT o FROM PosOrder o
            WHERE (:branchId IS NULL OR o.branchId = :branchId)
              AND (:status IS NULL OR o.status = :status)
            ORDER BY o.createdAt DESC
            """)
    Page<PosOrder> searchNoQuery(@Param("branchId") Long branchId,
                                 @Param("status") OrderStatus status,
                                 Pageable pageable);

    @Query("""
            SELECT o FROM PosOrder o
            WHERE o.status = com.poscashier.shared.enums.OrderStatus.PAID
              AND o.paidAt >= :start AND o.paidAt < :end
              AND (:branchId IS NULL OR o.branchId = :branchId)
            """)
    List<PosOrder> findPaidOrdersBetween(@Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end,
                                         @Param("branchId") Long branchId);

    @Query("""
            SELECT COUNT(o) FROM PosOrder o
            WHERE o.status = com.poscashier.shared.enums.OrderStatus.PAID
              AND o.paidAt >= :start AND o.paidAt < :end
            """)
    long countPaidOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
            SELECT o FROM PosOrder o
            WHERE o.kitchenStatus IS NOT NULL
              AND o.kitchenStatus IN ('PENDING', 'PREPARING', 'READY')
              AND o.status NOT IN (
                  com.poscashier.shared.enums.OrderStatus.CANCELLED,
                  com.poscashier.shared.enums.OrderStatus.REFUNDED)
              AND o.orderType IN (
                  com.poscashier.shared.enums.OrderType.DINE_IN,
                  com.poscashier.shared.enums.OrderType.TAKEAWAY,
                  com.poscashier.shared.enums.OrderType.DELIVERY)
              AND (:branchId IS NULL OR o.branchId = :branchId)
            ORDER BY o.createdAt ASC
            """)
    List<PosOrder> findKitchenQueue(@Param("branchId") Long branchId);

    @Query("""
            SELECT COUNT(o) FROM PosOrder o
            WHERE o.status = com.poscashier.shared.enums.OrderStatus.HELD
              AND (:branchId IS NULL OR o.branchId = :branchId)
            """)
    long countHeldOrders(@Param("branchId") Long branchId);
}
