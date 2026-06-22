package com.poscashier.modules.inventory.repository;

import com.poscashier.modules.inventory.entity.InventoryBalance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, Long> {

    Optional<InventoryBalance> findByBranchIdAndProductId(Long branchId, Long productId);

    List<InventoryBalance> findByBranchId(Long branchId);

    @Query("""
            SELECT ib FROM InventoryBalance ib
            WHERE (:branchId IS NULL OR ib.branchId = :branchId)
            """)
    Page<InventoryBalance> findByBranch(@Param("branchId") Long branchId, Pageable pageable);
}
