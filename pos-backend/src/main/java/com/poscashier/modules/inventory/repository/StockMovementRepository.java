package com.poscashier.modules.inventory.repository;

import com.poscashier.modules.inventory.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
            SELECT sm FROM StockMovement sm
            WHERE (:branchId IS NULL OR sm.branchId = :branchId)
              AND (:productId IS NULL OR sm.productId = :productId)
            ORDER BY sm.createdAt DESC
            """)
    Page<StockMovement> search(@Param("branchId") Long branchId,
                               @Param("productId") Long productId,
                               Pageable pageable);
}
