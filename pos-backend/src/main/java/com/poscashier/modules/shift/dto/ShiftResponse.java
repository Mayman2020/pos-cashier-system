package com.poscashier.modules.shift.dto;

import com.poscashier.modules.shift.entity.Shift;
import com.poscashier.shared.enums.ShiftStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ShiftResponse {

    private Long id;
    private Long branchId;
    private Long cashierId;
    private ShiftStatus status;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private BigDecimal openingCash;
    private BigDecimal expectedCash;
    private BigDecimal actualCash;
    private BigDecimal cashDifference;
    private BigDecimal totalSales;
    private String notes;

    public static ShiftResponse from(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .branchId(shift.getBranchId())
                .cashierId(shift.getCashierId())
                .status(shift.getStatus())
                .openedAt(shift.getOpenedAt())
                .closedAt(shift.getClosedAt())
                .openingCash(shift.getOpeningCash())
                .expectedCash(shift.getExpectedCash())
                .actualCash(shift.getActualCash())
                .cashDifference(shift.getCashDifference())
                .totalSales(shift.getTotalSales())
                .notes(shift.getNotes())
                .build();
    }
}
