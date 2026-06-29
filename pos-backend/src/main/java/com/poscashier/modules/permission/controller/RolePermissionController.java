package com.poscashier.modules.permission.controller;

import com.poscashier.modules.permission.annotation.RequiresPermission;
import com.poscashier.modules.permission.dto.RolePermissionResponse;
import com.poscashier.modules.permission.dto.RolePermissionUpdateRequest;
import com.poscashier.modules.permission.service.RolePermissionService;
import com.poscashier.shared.response.ApiResponse;
import com.poscashier.shared.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @GetMapping
    @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<List<RolePermissionResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.getAll()));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> getMine() {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.getMine(SecurityUtils.getCurrentUser())));
    }

    @GetMapping("/{role}")
    @RequiresPermission(module = "settings", action = "view")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.getByRole(role)));
    }

    @PutMapping("/{role}")
    @RequiresPermission(module = "settings", action = "edit")
    public ResponseEntity<ApiResponse<RolePermissionResponse>> update(
            @PathVariable String role,
            @Valid @RequestBody RolePermissionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(rolePermissionService.update(role, request)));
    }
}
