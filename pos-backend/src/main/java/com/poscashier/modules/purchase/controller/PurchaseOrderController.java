package com.poscashier.modules.purchase.controller;

import com.poscashier.modules.purchase.dto.PurchaseOrderRequest;
import com.poscashier.modules.purchase.dto.PurchaseOrderResponse;
import com.poscashier.modules.purchase.service.PurchaseOrderService;
import com.poscashier.shared.enums.PurchaseOrderStatus;
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
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderResponse>>> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) PurchaseOrderStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.list(branchId, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> create(
            @RequestParam(required = false) Long branchId,
            @Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(purchaseOrderService.create(branchId, request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> update(
            @PathVariable Long id, @Valid @RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.update(id, request)));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> receive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.receive(id)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        purchaseOrderService.cancel(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
