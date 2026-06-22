package com.poscashier.modules.receipt.controller;

import com.poscashier.modules.receipt.dto.ReceiptResponse;
import com.poscashier.modules.receipt.service.ReceiptService;
import com.poscashier.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<ReceiptResponse>> get(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok(receiptService.getReceipt(orderId)));
    }
}
