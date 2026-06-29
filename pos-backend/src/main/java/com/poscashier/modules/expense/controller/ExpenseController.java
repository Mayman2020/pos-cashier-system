package com.poscashier.modules.expense.controller;

import com.poscashier.modules.expense.dto.ExpenseRequest;
import com.poscashier.modules.expense.dto.ExpenseResponse;
import com.poscashier.modules.expense.service.ExpenseService;
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
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> list(
            @RequestParam(required = false) Long branchId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.list(branchId, pageable)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseResponse>> record(
            @RequestParam(required = false) Long branchId,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(expenseService.record(branchId, request)));
    }
}
