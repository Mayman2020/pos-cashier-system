package com.poscashier.modules.product.controller;

import com.poscashier.modules.product.dto.ProductVariantRequest;
import com.poscashier.modules.product.dto.ProductVariantResponse;
import com.poscashier.modules.product.service.ProductVariantService;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products/{productId}/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> list(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(variantService.listByProduct(productId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> create(
            @PathVariable Long productId, @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(variantService.create(productId, request)));
    }

    @PutMapping("/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> update(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(variantService.update(productId, variantId, request)));
    }

    @DeleteMapping("/{variantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long productId, @PathVariable Long variantId) {
        variantService.delete(productId, variantId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
