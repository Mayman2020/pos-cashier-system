package com.poscashier.modules.shift.service;

import com.poscashier.modules.shift.dto.CloseShiftRequest;
import com.poscashier.modules.shift.dto.OpenShiftRequest;
import com.poscashier.modules.shift.dto.ShiftResponse;
import com.poscashier.modules.shift.entity.Shift;
import com.poscashier.modules.shift.repository.ShiftRepository;
import com.poscashier.modules.user.entity.User;
import com.poscashier.shared.enums.ShiftStatus;
import com.poscashier.shared.exception.AppException;
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
    private final MessageSource messageSource;

    @Transactional(readOnly = true)
    public Page<ShiftResponse> list(Long branchId, Long cashierId, ShiftStatus status, Pageable pageable) {
        return shiftRepository.search(branchId, cashierId, status, pageable).map(ShiftResponse::from);
    }

    @Transactional
    public ShiftResponse open(OpenShiftRequest request) {
        User user = SecurityUtils.getCurrentUser();
        shiftRepository.findByCashierIdAndStatus(user.getId(), ShiftStatus.OPEN)
                .ifPresent(s -> { throw AppException.badRequest(msg("shift.error.already_open")); });
        Shift shift = Shift.builder()
                .branchId(request.getBranchId())
                .cashierId(user.getId())
                .status(ShiftStatus.OPEN)
                .openedAt(LocalDateTime.now())
                .openingCash(request.getOpeningCash() != null ? request.getOpeningCash() : BigDecimal.ZERO)
                .totalSales(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return ShiftResponse.from(shiftRepository.save(shift));
    }

    @Transactional
    public ShiftResponse close(Long id, CloseShiftRequest request) {
        Shift shift = findEntity(id);
        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw AppException.badRequest(msg("shift.error.not_open"));
        }
        BigDecimal expected = shift.getOpeningCash().add(shift.getTotalSales());
        shift.setExpectedCash(expected);
        shift.setActualCash(request.getActualCash());
        shift.setCashDifference(request.getActualCash().subtract(expected));
        shift.setNotes(request.getNotes());
        shift.setStatus(ShiftStatus.CLOSED);
        shift.setClosedAt(LocalDateTime.now());
        shift.setUpdatedAt(LocalDateTime.now());
        return ShiftResponse.from(shiftRepository.save(shift));
    }

    @Transactional(readOnly = true)
    public Shift getOpenShiftForCashier(Long cashierId) {
        return shiftRepository.findByCashierIdAndStatus(cashierId, ShiftStatus.OPEN)
                .orElseThrow(() -> AppException.badRequest(msg("pos.error.shift_not_open")));
    }

    @Transactional
    public void addSaleToShift(Long shiftId, BigDecimal amount) {
        Shift shift = findEntity(shiftId);
        shift.setTotalSales(shift.getTotalSales().add(amount));
        shift.setUpdatedAt(LocalDateTime.now());
        shiftRepository.save(shift);
    }

    @Transactional
    public void subtractSaleFromShift(Long shiftId, BigDecimal amount) {
        Shift shift = findEntity(shiftId);
        BigDecimal updated = shift.getTotalSales().subtract(amount);
        shift.setTotalSales(updated.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : updated);
        shift.setUpdatedAt(LocalDateTime.now());
        shiftRepository.save(shift);
    }

    @Transactional(readOnly = true)
    public ShiftResponse getCurrentOpen() {
        User user = SecurityUtils.getCurrentUser();
        return shiftRepository.findByCashierIdAndStatus(user.getId(), ShiftStatus.OPEN)
                .map(ShiftResponse::from)
                .orElse(null);
    }

    public Shift findEntity(Long id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> AppException.notFound(msg("shift.error.not_found")));
    }

    private String msg(String code) {
        return messageSource.getMessage(code, null, code, LocaleContextHolder.getLocale());
    }
}
