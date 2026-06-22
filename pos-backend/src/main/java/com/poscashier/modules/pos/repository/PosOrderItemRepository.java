package com.poscashier.modules.pos.repository;

import com.poscashier.modules.pos.entity.PosOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PosOrderItemRepository extends JpaRepository<PosOrderItem, Long> {

    List<PosOrderItem> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);
}
