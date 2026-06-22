package com.poscashier.modules.shift.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OpenShiftRequest {

    @NotNull
    private Long branchId;

    private BigDecimal openingCash;
}
