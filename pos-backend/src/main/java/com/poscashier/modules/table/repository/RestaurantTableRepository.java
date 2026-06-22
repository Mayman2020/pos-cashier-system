package com.poscashier.modules.table.repository;

import com.poscashier.modules.table.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    List<RestaurantTable> findByBranchId(Long branchId);

    Optional<RestaurantTable> findByBranchIdAndTableNumber(Long branchId, String tableNumber);
}
