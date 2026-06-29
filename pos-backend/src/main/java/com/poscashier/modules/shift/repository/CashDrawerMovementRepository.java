package com.poscashier.modules.shift.repository;

import com.poscashier.modules.shift.entity.CashDrawerMovement;
import com.poscashier.shared.enums.CashDrawerMovementType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CashDrawerMovementRepository extends JpaRepository<CashDrawerMovement, Long> {

    List<CashDrawerMovement> findByShiftIdOrderByCreatedAtAsc(Long shiftId);

    List<CashDrawerMovement> findByShiftIdInAndMovementTypeOrderByCreatedAtDesc(
            List<Long> shiftIds, CashDrawerMovementType movementType);
}
