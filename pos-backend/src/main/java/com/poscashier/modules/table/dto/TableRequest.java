package com.poscashier.modules.table.dto;

import com.poscashier.shared.enums.TableStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TableRequest {

    @NotNull
    private Long branchId;

    @NotBlank
    @Size(max = 30)
    private String tableNumber;

    private Integer capacity;

    private TableStatus status;
}
