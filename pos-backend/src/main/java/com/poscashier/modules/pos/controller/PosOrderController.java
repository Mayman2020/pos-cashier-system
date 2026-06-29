package com.poscashier.modules.pos.controller;

import com.poscashier.modules.pos.dto.CreateOrderRequest;
import com.poscashier.modules.pos.dto.OrderResponse;
import com.poscashier.modules.pos.dto.PayOrderRequest;
import com.poscashier.modules.pos.dto.RefundOrderRequest;
import com.poscashier.modules.pos.dto.UpdateOrderRequest;
import com.poscashier.modules.pos.service.PosOrderService;
import com.poscashier.shared.enums.OrderStatus;
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
@RequestMapping("/pos/orders")
@RequiredArgsConstructor
public class PosOrderController {

    private final PosOrderService posOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.list(branchId, status, q, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(posOrderService.create(request)));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> pay(
            @PathVariable Long id, @Valid @RequestBody PayOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.pay(id, request)));
    }

    @PostMapping("/{id}/hold")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> hold(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.hold(id)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.cancel(id)));
    }

    @PostMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> resume(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.resume(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<OrderResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.update(id, request)));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<OrderResponse>> refund(
            @PathVariable Long id, @Valid @RequestBody(required = false) RefundOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(posOrderService.refund(id, request)));
    }
}
