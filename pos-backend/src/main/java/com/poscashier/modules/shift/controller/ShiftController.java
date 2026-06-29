package com.poscashier.modules.shift.controller;

import com.poscashier.modules.shift.dto.CashDrawerMovementResponse;
import com.poscashier.modules.shift.dto.CloseShiftRequest;
import com.poscashier.modules.shift.dto.OpenShiftRequest;
import com.poscashier.modules.shift.dto.PayoutRequest;
import com.poscashier.modules.shift.dto.ShiftResponse;
import com.poscashier.modules.shift.repository.CashDrawerMovementRepository;
import com.poscashier.modules.shift.service.ShiftService;
import com.poscashier.shared.enums.ShiftStatus;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;
    private final CashDrawerMovementRepository cashDrawerMovementRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<Page<ShiftResponse>>> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long cashierId,
            @RequestParam(required = false) ShiftStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.list(branchId, cashierId, status, pageable)));
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> current() {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.getCurrentOpen()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.getById(id)));
    }

    @GetMapping("/{id}/drawer-movements")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<CashDrawerMovementResponse>>> drawerMovements(@PathVariable Long id) {
        shiftService.getById(id);
        List<CashDrawerMovementResponse> rows = cashDrawerMovementRepository.findByShiftIdOrderByCreatedAtAsc(id)
                .stream().map(CashDrawerMovementResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(rows));
    }

    @PostMapping("/open")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> open(@Valid @RequestBody OpenShiftRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(shiftService.open(request)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> close(
            @PathVariable Long id, @Valid @RequestBody CloseShiftRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.close(id, request)));
    }

    @PostMapping("/{id}/payout")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> payout(
            @PathVariable Long id, @Valid @RequestBody PayoutRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(shiftService.payout(id, request)));
    }
}
