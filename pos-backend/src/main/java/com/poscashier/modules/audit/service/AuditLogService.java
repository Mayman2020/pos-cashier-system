package com.poscashier.modules.audit.service;

import com.poscashier.modules.audit.dto.AuditLogResponse;
import com.poscashier.modules.audit.entity.AuditLog;
import com.poscashier.modules.audit.repository.AuditLogRepository;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.util.BranchContext;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(String action, String entityType, Long entityId, String details, Long branchId) {
        User user = SecurityUtils.getCurrentUserOrNull();
        auditLogRepository.save(AuditLog.builder()
                .branchId(branchId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .username(user != null ? user.getUsername() : "system")
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> list(Long branchId, Pageable pageable) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        return auditLogRepository.findByBranchIdOrderByCreatedAtDesc(resolved, pageable)
                .map(AuditLogResponse::from);
    }
}
