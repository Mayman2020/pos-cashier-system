package com.poscashier.modules.user.controller;

import com.poscashier.modules.permission.annotation.RequiresPermission;
import com.poscashier.modules.user.dto.ChangePasswordRequest;
import com.poscashier.modules.user.dto.UserRequest;
import com.poscashier.modules.user.dto.UserResponse;
import com.poscashier.modules.user.service.UserService;
import com.poscashier.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @RequiresPermission(module = "users", action = "view")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> list(
            @RequestParam(required = false) String q, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(userService.list(q, pageable)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUser()));
    }

    @GetMapping("/{id}")
    @RequiresPermission(module = "users", action = "view")
    public ResponseEntity<ApiResponse<UserResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(id)));
    }

    @PostMapping
    @RequiresPermission(module = "users", action = "create")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(userService.create(request)));
    }

    @PutMapping("/{id}")
    @RequiresPermission(module = "users", action = "edit")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle-active")
    @RequiresPermission(module = "users", action = "edit")
    public ResponseEntity<ApiResponse<UserResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    @RequiresPermission(module = "users", action = "delete")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }
}
