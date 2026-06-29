package com.poscashier.modules.shift.service;

import com.poscashier.modules.shift.entity.CashDrawerMovement;
import com.poscashier.modules.shift.repository.CashDrawerMovementRepository;
import com.poscashier.shared.enums.CashDrawerMovementType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CashDrawerService {

    private final CashDrawerMovementRepository repository;

    @Transactional
    public void record(Long shiftId, CashDrawerMovementType type, BigDecimal amount, String notes, String username) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }
        repository.save(CashDrawerMovement.builder()
                .shiftId(shiftId)
                .movementType(type)
                .amount(amount)
                .notes(notes)
                .createdAt(LocalDateTime.now())
                .createdBy(username)
                .build());
    }
}
