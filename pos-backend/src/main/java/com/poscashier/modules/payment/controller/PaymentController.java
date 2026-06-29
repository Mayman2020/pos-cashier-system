package com.poscashier.modules.payment.controller;

import com.poscashier.modules.payment.dto.PaymentResponse;
import com.poscashier.modules.payment.service.PaymentService;
import com.poscashier.modules.pos.service.PosOrderService;
import com.poscashier.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PosOrderService posOrderService;

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> byOrder(@PathVariable Long orderId) {
        posOrderService.getById(orderId);
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getByOrderId(orderId)));
    }
}
