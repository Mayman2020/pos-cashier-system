package com.poscashier.modules.purchase.repository;

import com.poscashier.modules.purchase.entity.PurchaseOrder;
import com.poscashier.shared.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Page<PurchaseOrder> findByBranchIdOrderByCreatedAtDesc(Long branchId, Pageable pageable);

    Page<PurchaseOrder> findByBranchIdAndStatusOrderByCreatedAtDesc(Long branchId, PurchaseOrderStatus status, Pageable pageable);
}
