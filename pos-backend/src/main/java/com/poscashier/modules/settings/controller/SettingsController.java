package com.poscashier.modules.settings.controller;

import com.poscashier.modules.settings.dto.SettingsResponse;
import com.poscashier.modules.settings.dto.SettingsUpdateRequest;
import com.poscashier.modules.settings.service.SettingsService;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<SettingsResponse>> get() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getAll()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingsResponse>> update(@Valid @RequestBody SettingsUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.update(request)));
    }
}
