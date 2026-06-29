package com.poscashier.modules.customer.controller;

import com.poscashier.modules.customer.dto.CustomerRequest;
import com.poscashier.modules.customer.dto.CustomerResponse;
import com.poscashier.modules.customer.dto.LoyaltyAdjustRequest;
import com.poscashier.modules.customer.dto.LoyaltyTransactionResponse;
import com.poscashier.modules.customer.entity.Customer;
import com.poscashier.modules.customer.service.CustomerService;
import com.poscashier.modules.customer.service.LoyaltyService;
import com.poscashier.shared.response.ApiResponse;
import com.poscashier.shared.util.SecurityUtils;
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
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final LoyaltyService loyaltyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> list(
            @RequestParam(required = false) String q, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.list(q, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> create(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(customerService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{id}/loyalty/transactions")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<LoyaltyTransactionResponse>>> loyaltyTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(loyaltyService.listTransactions(id)));
    }

    @PostMapping("/{id}/loyalty/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<CustomerResponse>> loyaltyAdjust(
            @PathVariable Long id, @Valid @RequestBody LoyaltyAdjustRequest request) {
        Customer customer = loyaltyService.adjustPoints(
                id, request.getPoints(), request.getNotes(), SecurityUtils.getCurrentUser().getUsername());
        return ResponseEntity.ok(ApiResponse.ok(CustomerResponse.from(customer)));
    }
}
