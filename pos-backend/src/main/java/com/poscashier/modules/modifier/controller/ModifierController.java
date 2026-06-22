package com.poscashier.modules.modifier.controller;

import com.poscashier.modules.modifier.dto.ModifierRequest;
import com.poscashier.modules.modifier.dto.ModifierResponse;
import com.poscashier.modules.modifier.service.ModifierService;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/modifiers")
@RequiredArgsConstructor
public class ModifierController {

    private final ModifierService modifierService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
    public ResponseEntity<ApiResponse<List<ModifierResponse>>> list(
            @RequestParam(required = false) Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(modifierService.list(productId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ModifierResponse>> create(@Valid @RequestBody ModifierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(modifierService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ModifierResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ModifierRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(modifierService.update(id, request)));
    }
}
