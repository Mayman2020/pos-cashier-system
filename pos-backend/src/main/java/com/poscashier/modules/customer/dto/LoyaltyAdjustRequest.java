package com.poscashier.modules.customer.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoyaltyAdjustRequest {

    @NotNull
    private Integer points;

    private String notes;
}
