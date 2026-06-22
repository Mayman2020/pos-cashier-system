package com.poscashier.modules.kitchen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class KitchenUpdateStatusRequest {

    @NotBlank
    @Pattern(regexp = "PENDING|PREPARING|READY|SERVED")
    private String kitchenStatus;
}
