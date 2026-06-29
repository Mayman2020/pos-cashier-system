package com.poscashier.modules.audit.dto;

import com.poscashier.modules.audit.entity.AuditLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {

    private Long id;
    private Long branchId;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private String username;
    private LocalDateTime createdAt;

    public static AuditLogResponse from(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .branchId(log.getBranchId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .username(log.getUsername())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
