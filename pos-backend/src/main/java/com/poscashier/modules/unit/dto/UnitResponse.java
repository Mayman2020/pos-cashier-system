package com.poscashier.modules.unit.dto;

import com.poscashier.modules.unit.entity.Unit;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UnitResponse {

    private Long id;
    private String code;
    private String name;
    private String symbol;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UnitResponse from(Unit unit) {
        return UnitResponse.builder()
                .id(unit.getId())
                .code(unit.getCode())
                .name(unit.getName())
                .symbol(unit.getSymbol())
                .createdAt(unit.getCreatedAt())
                .updatedAt(unit.getUpdatedAt())
                .build();
    }
}
