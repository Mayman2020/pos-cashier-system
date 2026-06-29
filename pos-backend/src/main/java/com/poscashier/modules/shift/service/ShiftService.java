package com.poscashier.modules.shift.service;

import com.poscashier.modules.shift.dto.CloseShiftRequest;
import com.poscashier.modules.shift.dto.OpenShiftRequest;
import com.poscashier.modules.shift.dto.PayoutRequest;
import com.poscashier.modules.shift.dto.ShiftResponse;
import com.poscashier.modules.shift.entity.Shift;
import com.poscashier.modules.shift.repository.CashDrawerMovementRepository;
import com.poscashier.modules.shift.repository.ShiftRepository;
import com.poscashier.modules.audit.service.AuditLogService;
import com.poscashier.modules.settings.service.SettingsService;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.CashDrawerMovementType;
import com.poscashier.shared.enums.PaymentMethod;
import com.poscashier.shared.enums.ShiftStatus;
import com.poscashier.shared.exception.AppException;
import com.poscashier.shared.util.BranchContext;
import com.poscashier.shared.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final CashDrawerMovementRepository cashDrawerMovementRepository;
    private final CashDrawerService cashDrawerService;
    private final SettingsService settingsService;
    private final AuditLogService auditLogService;
    private final MessageSource messageSource;

    @Transactional(readOnly = true)
    public Page<ShiftResponse> list(Long branchId, Long cashierId, ShiftStatus status, Pageable pageable) {
        Long resolvedBranch = BranchContext.resolveBranchId(branchId);
        return shiftRepository.search(resolvedBranch, cashierId, status, pageable).map(ShiftResponse::from);
    }

    @Transactional
    public ShiftResponse open(OpenShiftRequest request) {
        User user = SecurityUtils.getCurrentUser();
        Long branchId = BranchContext.resolveBranchId(request.getBranchId());
        shiftRepository.findByCashierIdAndStatus(user.getId(), ShiftStatus.OPEN)
                .ifPresent(s -> { throw AppException.badRequest(msg("shift.error.already_open")); });
        BigDecimal openingCash = request.getOpeningCash() != null ? request.getOpeningCash() : BigDecimal.ZERO;
        Shift shift = Shift.builder()
                .branchId(branchId)
                .cashierId(user.getId())
                .status(ShiftStatus.OPEN)
                .openedAt(LocalDateTime.now())
                .openingCash(openingCash)
                .totalSales(BigDecimal.ZERO)
                .totalCashSales(BigDecimal.ZERO)
                .totalCardSales(BigDecimal.ZERO)
                .totalRefundsCash(BigDecimal.ZERO)
                .totalRefundsCard(BigDecimal.ZERO)
                .totalPayouts(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        shift = shiftRepository.save(shift);
        cashDrawerService.record(shift.getId(), CashDrawerMovementType.OPENING, openingCash, "Shift opening", user.getUsername());
        auditLogService.record("OPEN", "SHIFT", shift.getId(), "Opening cash " + openingCash, branchId);
        return ShiftResponse.from(shift);
    }

    @Transactional
    public ShiftResponse close(Long id, CloseShiftRequest request) {
        Shift shift = findEntity(id);
        assertShiftAccess(shift);
        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw AppException.badRequest(msg("shift.error.not_open"));
        }
        BigDecimal expected = shift.getOpeningCash()
                .add(shift.getTotalCashSales())
                .subtract(shift.getTotalRefundsCash())
                .subtract(shift.getTotalPayouts());
        shift.setExpectedCash(expected);
        shift.setActualCash(request.getActualCash());
        shift.setCashDifference(request.getActualCash().subtract(expected));
        BigDecimal threshold = settingsService.getDecimal("cash_variance_threshold", new BigDecimal("50"));
        if (shift.getCashDifference().abs().compareTo(threshold) > 0 && !Boolean.TRUE.equals(request.getForceClose())) {
            throw AppException.badRequest(msg("shift.error.variance_exceeds_threshold"));
        }
        shift.setNotes(request.getNotes());
        shift.setStatus(ShiftStatus.CLOSED);
        shift.setClosedAt(LocalDateTime.now());
        shift.setUpdatedAt(LocalDateTime.now());
        shift = shiftRepository.save(shift);
        User user = SecurityUtils.getCurrentUser();
        cashDrawerService.record(shift.getId(), CashDrawerMovementType.CLOSING, request.getActualCash(), "Shift closing", user.getUsername());
        auditLogService.record("CLOSE", "SHIFT", shift.getId(),
                "Variance " + shift.getCashDifference(), shift.getBranchId());
        return ShiftResponse.from(shift);
    }

    @Transactional
    public ShiftResponse payout(Long id, PayoutRequest request) {
        Shift shift = findEntity(id);
        assertShiftAccess(shift);
        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw AppException.badRequest(msg("shift.error.not_open"));
        }
        shift.setTotalPayouts(shift.getTotalPayouts().add(request.getAmount()));
        shift.setUpdatedAt(LocalDateTime.now());
        shiftRepository.save(shift);
        User user = SecurityUtils.getCurrentUser();
        cashDrawerService.record(shift.getId(), CashDrawerMovementType.PAYOUT, request.getAmount().negate(),
                request.getNotes(), user.getUsername());
        auditLogService.record("PAYOUT", "SHIFT", shift.getId(),
                "Amount " + request.getAmount(), shift.getBranchId());
        return ShiftResponse.from(shift);
    }

    @Transactional(readOnly = true)
    public Shift getOpenShiftForCashier(Long cashierId) {
        return shiftRepository.findByCashierIdAndStatus(cashierId, ShiftStatus.OPEN)
                .orElseThrow(() -> AppException.badRequest(msg("pos.error.shift_not_open")));
    }

    @Transactional
    public void recordSale(Long shiftId, PaymentMethod method, BigDecimal totalAmount,
                           BigDecimal cashAmount, BigDecimal cardAmount) {
        Shift shift = findEntity(shiftId);
        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw AppException.badRequest(msg("shift.error.not_open"));
        }
        shift.setTotalSales(shift.getTotalSales().add(totalAmount));
        BigDecimal cash = resolveCashPortion(method, totalAmount, cashAmount, cardAmount);
        BigDecimal card = resolveCardPortion(method, totalAmount, cashAmount, cardAmount);
        shift.setTotalCashSales(shift.getTotalCashSales().add(cash));
        shift.setTotalCardSales(shift.getTotalCardSales().add(card));
        shift.setUpdatedAt(LocalDateTime.now());
        shiftRepository.save(shift);
        User user = SecurityUtils.getCurrentUser();
        if (cash.compareTo(BigDecimal.ZERO) > 0) {
            cashDrawerService.record(shiftId, CashDrawerMovementType.SALE, cash, "Cash sale", user.getUsername());
        }
    }

    @Transactional
    public void recordRefund(Long shiftId, PaymentMethod method, BigDecimal amount,
                             BigDecimal cashAmount, BigDecimal cardAmount) {
        Shift shift = findEntity(shiftId);
        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw AppException.badRequest(msg("shift.error.not_open"));
        }
        shift.setTotalSales(shift.getTotalSales().subtract(amount).max(BigDecimal.ZERO));
        BigDecimal cash = resolveCashPortion(method, amount, cashAmount, cardAmount);
        BigDecimal card = resolveCardPortion(method, amount, cashAmount, cardAmount);
        shift.setTotalRefundsCash(shift.getTotalRefundsCash().add(cash));
        shift.setTotalRefundsCard(shift.getTotalRefundsCard().add(card));
        shift.setUpdatedAt(LocalDateTime.now());
        shiftRepository.save(shift);
        User user = SecurityUtils.getCurrentUser();
        if (cash.compareTo(BigDecimal.ZERO) > 0) {
            cashDrawerService.record(shiftId, CashDrawerMovementType.REFUND, cash.negate(), "Cash refund", user.getUsername());
        }
    }

    @Transactional(readOnly = true)
    public ShiftResponse getCurrentOpen() {
        User user = SecurityUtils.getCurrentUser();
        return shiftRepository.findByCashierIdAndStatus(user.getId(), ShiftStatus.OPEN)
                .map(ShiftResponse::from)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ShiftResponse getById(Long id) {
        Shift shift = findEntity(id);
        assertShiftAccess(shift);
        return ShiftResponse.from(shift);
    }

    public Shift findEntity(Long id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> AppException.notFound(msg("shift.error.not_found")));
    }

    private void assertShiftAccess(Shift shift) {
        User user = SecurityUtils.getCurrentUser();
        if (!SecurityUtils.hasRole(user, "ADMIN") && !SecurityUtils.hasRole(user, "MANAGER")) {
            if (!user.getId().equals(shift.getCashierId())) {
                throw AppException.forbidden("Cannot access another cashier shift");
            }
        }
        BranchContext.assertBranchAccess(shift.getBranchId());
    }

    private BigDecimal resolveCashPortion(PaymentMethod method, BigDecimal total,
                                          BigDecimal cashAmount, BigDecimal cardAmount) {
        return switch (method) {
            case CASH -> total;
            case CARD, OTHER -> BigDecimal.ZERO;
            case MIXED -> cashAmount != null ? cashAmount : BigDecimal.ZERO;
        };
    }

    private BigDecimal resolveCardPortion(PaymentMethod method, BigDecimal total,
                                          BigDecimal cashAmount, BigDecimal cardAmount) {
        return switch (method) {
            case CARD, OTHER -> total;
            case CASH -> BigDecimal.ZERO;
            case MIXED -> cardAmount != null ? cardAmount : BigDecimal.ZERO;
        };
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }
}
