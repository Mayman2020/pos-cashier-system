package com.poscashier.modules.shift.repository;

import com.poscashier.modules.shift.entity.Shift;
import com.poscashier.shared.enums.ShiftStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    Optional<Shift> findByCashierIdAndStatus(Long cashierId, ShiftStatus status);

    @Query("""
            SELECT s FROM Shift s
            WHERE (:branchId IS NULL OR s.branchId = :branchId)
              AND (:cashierId IS NULL OR s.cashierId = :cashierId)
              AND (:status IS NULL OR s.status = :status)
            ORDER BY s.openedAt DESC
            """)
    Page<Shift> search(@Param("branchId") Long branchId,
                       @Param("cashierId") Long cashierId,
                       @Param("status") ShiftStatus status,
                       Pageable pageable);
}
