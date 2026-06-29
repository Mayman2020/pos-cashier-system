package com.poscashier.modules.inventory.controller;

import com.poscashier.modules.inventory.dto.*;
import com.poscashier.modules.inventory.service.InventoryService;
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
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/balances")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<Page<InventoryBalanceResponse>>> balances(
            @RequestParam(required = false) Long branchId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.listBalances(branchId, pageable)));
    }

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<Page<StockMovementResponse>>> movements(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long productId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.listMovements(branchId, productId, pageable)));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<InventoryBalanceResponse>>> lowStock(
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.lowStock(branchId)));
    }

    @GetMapping("/availability")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<StockAvailabilityResponse>> availability(
            @RequestParam Long branchId, @RequestParam Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getAvailability(branchId, productId)));
    }

    @PostMapping("/stock-in")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<StockMovementResponse>> stockIn(@Valid @RequestBody StockInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(inventoryService.stockIn(request)));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<StockMovementResponse>> adjust(@Valid @RequestBody StockAdjustRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.adjust(request)));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<StockMovementResponse>> transfer(@Valid @RequestBody StockTransferRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.transfer(request)));
    }
}
