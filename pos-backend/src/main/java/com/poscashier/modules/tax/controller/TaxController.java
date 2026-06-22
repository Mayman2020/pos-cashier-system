package com.poscashier.modules.tax.controller;

import com.poscashier.modules.tax.dto.TaxRequest;
import com.poscashier.modules.tax.dto.TaxResponse;
import com.poscashier.modules.tax.service.TaxService;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/taxes")
@RequiredArgsConstructor
public class TaxController {

    private final TaxService taxService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<TaxResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(taxService.list()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<TaxResponse>> create(@Valid @RequestBody TaxRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(taxService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<TaxResponse>> update(
            @PathVariable Long id, @Valid @RequestBody TaxRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(taxService.update(id, request)));
    }
}
