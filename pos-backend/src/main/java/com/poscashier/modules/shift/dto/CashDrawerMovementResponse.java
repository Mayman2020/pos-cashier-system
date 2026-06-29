package com.poscashier.modules.shift.dto;

import com.poscashier.modules.shift.entity.CashDrawerMovement;
import com.poscashier.shared.enums.CashDrawerMovementType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CashDrawerMovementResponse {

    private Long id;
    private Long shiftId;
    private CashDrawerMovementType movementType;
    private BigDecimal amount;
    private String notes;
    private LocalDateTime createdAt;
    private String createdBy;

    public static CashDrawerMovementResponse from(CashDrawerMovement m) {
        return CashDrawerMovementResponse.builder()
                .id(m.getId())
                .shiftId(m.getShiftId())
                .movementType(m.getMovementType())
                .amount(m.getAmount())
                .notes(m.getNotes())
                .createdAt(m.getCreatedAt())
                .createdBy(m.getCreatedBy())
                .build();
    }
}
