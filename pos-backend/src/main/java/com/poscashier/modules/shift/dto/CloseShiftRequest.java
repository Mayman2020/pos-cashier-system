package com.poscashier.modules.shift.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CloseShiftRequest {

    @NotNull
    private BigDecimal actualCash;

    private String notes;

    /** When true, close shift even if cash variance exceeds configured threshold. */
    private Boolean forceClose;
}
