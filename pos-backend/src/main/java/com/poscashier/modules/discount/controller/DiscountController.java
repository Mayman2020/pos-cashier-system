package com.poscashier.modules.discount.controller;

import com.poscashier.modules.discount.dto.DiscountRequest;
import com.poscashier.modules.discount.dto.DiscountResponse;
import com.poscashier.modules.discount.service.DiscountService;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<DiscountResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(discountService.list()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<DiscountResponse>> create(@Valid @RequestBody DiscountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(discountService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<DiscountResponse>> update(
            @PathVariable Long id, @Valid @RequestBody DiscountRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(discountService.update(id, request)));
    }
}
