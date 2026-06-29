package com.poscashier.modules.audit.controller;

import com.poscashier.modules.audit.dto.AuditLogResponse;
import com.poscashier.modules.audit.service.AuditLogService;
import com.poscashier.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> list(
            @RequestParam(required = false) Long branchId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(auditLogService.list(branchId, pageable)));
    }
}
