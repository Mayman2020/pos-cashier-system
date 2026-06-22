package com.poscashier.modules.kitchen.controller;

import com.poscashier.modules.kitchen.dto.KitchenUpdateStatusRequest;
import com.poscashier.modules.kitchen.service.KitchenService;
import com.poscashier.modules.pos.dto.OrderResponse;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final KitchenService kitchenService;

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> queue(
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(kitchenService.queue(branchId)));
    }

    @PatchMapping("/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id, @Valid @RequestBody KitchenUpdateStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                kitchenService.updateStatus(id, request.getKitchenStatus())));
    }
}
