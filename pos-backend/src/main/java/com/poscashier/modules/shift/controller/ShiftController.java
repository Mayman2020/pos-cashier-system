package com.poscashier.modules.shift.controller;

import com.poscashier.modules.shift.dto.CloseShiftRequest;
import com.poscashier.modules.shift.dto.OpenShiftRequest;
import com.poscashier.modules.shift.dto.ShiftResponse;
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

@RestController
@RequestMapping("/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

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
}
