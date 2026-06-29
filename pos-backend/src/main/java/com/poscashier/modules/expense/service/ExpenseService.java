package com.poscashier.modules.expense.service;

import com.poscashier.modules.audit.service.AuditLogService;
import com.poscashier.modules.expense.dto.ExpenseRequest;
import com.poscashier.modules.expense.dto.ExpenseResponse;
import com.poscashier.modules.shift.entity.CashDrawerMovement;
import com.poscashier.modules.shift.entity.Shift;
import com.poscashier.modules.shift.repository.CashDrawerMovementRepository;
import com.poscashier.modules.shift.repository.ShiftRepository;
import com.poscashier.modules.shift.service.CashDrawerService;
import com.poscashier.modules.shift.service.ShiftService;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.CashDrawerMovementType;
import com.poscashier.shared.util.BranchContext;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ShiftRepository shiftRepository;
    private final CashDrawerMovementRepository movementRepository;
    private final ShiftService shiftService;
    private final CashDrawerService cashDrawerService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<ExpenseResponse> list(Long branchId, Pageable pageable) {
        Long resolved = BranchContext.resolveBranchId(branchId);
        List<Long> shiftIds = shiftRepository.search(resolved, null, null, Pageable.unpaged())
                .getContent().stream().map(Shift::getId).toList();
        if (shiftIds.isEmpty()) {
            return Page.empty(pageable);
        }
        List<ExpenseResponse> all = movementRepository.findByShiftIdInAndMovementTypeOrderByCreatedAtDesc(
                        shiftIds, CashDrawerMovementType.EXPENSE).stream()
                .map(ExpenseResponse::from)
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        if (start >= all.size()) {
            return new PageImpl<>(List.of(), pageable, all.size());
        }
        return new PageImpl<>(all.subList(start, end), pageable, all.size());
    }

    @Transactional
    public ExpenseResponse record(Long branchId, ExpenseRequest request) {
        BranchContext.resolveBranchId(branchId);
        User user = SecurityUtils.getCurrentUser();
        Shift open = shiftService.getOpenShiftForCashier(user.getId());
        open.setTotalPayouts(open.getTotalPayouts().add(request.getAmount()));
        open.setUpdatedAt(LocalDateTime.now());
        shiftRepository.save(open);
        String notes = request.getNotes() != null ? request.getNotes() : "Expense";
        cashDrawerService.record(open.getId(), CashDrawerMovementType.EXPENSE,
                request.getAmount().negate(), notes, user.getUsername());
        auditLogService.record("EXPENSE", "SHIFT", open.getId(),
                "Amount " + request.getAmount() + " — " + notes, open.getBranchId());
        List<CashDrawerMovement> movements = movementRepository.findByShiftIdOrderByCreatedAtAsc(open.getId());
        CashDrawerMovement last = movements.get(movements.size() - 1);
        return ExpenseResponse.from(last);
    }
}
