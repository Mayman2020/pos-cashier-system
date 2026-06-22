package com.poscashier.modules.table.dto;

import com.poscashier.modules.table.entity.RestaurantTable;
import com.poscashier.shared.enums.TableStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TableResponse {

    private Long id;
    private Long branchId;
    private String tableNumber;
    private int capacity;
    private TableStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TableResponse from(RestaurantTable table) {
        return TableResponse.builder()
                .id(table.getId())
                .branchId(table.getBranchId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();
    }
}
