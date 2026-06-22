package com.poscashier.modules.inventory.dto;

import com.poscashier.modules.inventory.entity.StockMovement;
import com.poscashier.shared.enums.MovementType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class StockMovementResponse {

    private Long id;
    private Long branchId;
    private Long productId;
    private MovementType movementType;
    private BigDecimal quantity;
    private String referenceType;
    private Long referenceId;
    private String notes;
    private LocalDateTime createdAt;
    private String createdBy;

    public static StockMovementResponse from(StockMovement movement) {
        return StockMovementResponse.builder()
                .id(movement.getId())
                .branchId(movement.getBranchId())
                .productId(movement.getProductId())
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .referenceType(movement.getReferenceType())
                .referenceId(movement.getReferenceId())
                .notes(movement.getNotes())
                .createdAt(movement.getCreatedAt())
                .createdBy(movement.getCreatedBy())
                .build();
    }
}
